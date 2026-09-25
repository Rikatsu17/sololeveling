import Database from "better-sqlite3";
import {
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { promisify } from "node:util";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { databaseContext, openDatabase, seed, db } from "./db.js";
import { storage } from "./storage.js";
const scrypt = promisify(scryptCallback);
const root = storage.accountsPath;
mkdirSync(root, { recursive: true });
const registry = new Database(join(root, "registry.db"));
registry.pragma("journal_mode = WAL");
registry.pragma("foreign_keys = ON");
registry.pragma("synchronous = FULL");
registry.pragma("busy_timeout = 5000");
registry.exec(`CREATE TABLE IF NOT EXISTS Accounts(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,password_hash TEXT NOT NULL,salt TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS Sessions(token_hash TEXT PRIMARY KEY,account_id TEXT REFERENCES Accounts(id) ON DELETE CASCADE,expires_at INTEGER NOT NULL);`);
const connections = new Map();
const attempts = new Map();
const hash = (value) => createHash("sha256").update(value).digest("hex");
const publicAccount = (a) => ({ id: a.id, email: a.email, name: a.name });
const tokenFrom = (req) => {
  const match = (req.headers.cookie || "").match(
    /(?:^|;\s*)ascend_session=([a-f0-9]{64})(?:;|$)/,
  );
  return match?.[1];
};
function accountDatabase(id) {
  if (!connections.has(id)) {
    connections.set(id, openDatabase(join(root, `${id}.db`)));
  }
  return connections.get(id);
}
function cookie(req, res, token, age = 60 * 60 * 24 * 30) {
  res.cookie("ascend_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true" || req.secure,
    maxAge: age * 1000,
    path: "/",
  });
}
function session(req, res, account) {
  registry
    .prepare("DELETE FROM Sessions WHERE expires_at <= ?")
    .run(Date.now());
  const old = tokenFrom(req);
  if (old)
    registry.prepare("DELETE FROM Sessions WHERE token_hash=?").run(hash(old));
  const token = randomBytes(32).toString("hex");
  registry
    .prepare("INSERT INTO Sessions VALUES (?,?,?)")
    .run(hash(token), account.id, Date.now() + 30 * 86400000);
  cookie(req, res, token);
}
function credentials(body) {
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const password = String(body.password || "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    throw new Error("Enter a valid email address.");
  if (password.length < 10 || password.length > 128)
    throw new Error("Use a password between 10 and 128 characters.");
  return { email, password };
}
export function installAccounts(app, getState) {
  app.use("/api", (req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      req.headers.origin
    ) {
      try {
        const origin = new URL(req.headers.origin);
        // A preview/reverse proxy may rewrite Host after the browser made a
        // same-origin request. Fetch Metadata is set by the browser, not page JS.
        const sameOriginRequest =
          req.headers["sec-fetch-site"] === "same-origin";
        if (
          !["http:", "https:"].includes(origin.protocol) ||
          (origin.host !== req.headers.host && !sameOriginRequest)
        )
          return res.status(403).json({
            error:
              "Request blocked because its website origin could not be verified. Reload Ascend and try again.",
          });
      } catch {
        return res.status(403).json({ error: "Invalid request origin." });
      }
    }
    const token = tokenFrom(req);
    if (!token) return next();
    const account = registry
      .prepare(
        "SELECT a.* FROM Sessions s JOIN Accounts a ON a.id=s.account_id WHERE s.token_hash=? AND s.expires_at>?",
      )
      .get(hash(token), Date.now());
    if (!account) {
      cookie(req, res, "", 0);
      return res.status(401).json({
        error: "Your session has expired. Refresh the page to sign in again.",
      });
    }
    databaseContext.run(
      {
        database: accountDatabase(account.id),
        account: publicAccount(account),
      },
      next,
    );
  });
  app.use("/api/auth", (req, res, next) => {
    if (req.method !== "POST") return next();
    const key = req.ip;
    const now = Date.now();
    const item = attempts.get(key);
    if (!item || item.until < now)
      attempts.set(key, { count: 1, until: now + 15 * 60000 });
    else {
      item.count++;
      if (item.count > 30)
        return res.status(429).json({
          error: "Too many attempts. Please try again in 15 minutes.",
        });
    }
    if (attempts.size > 10000)
      for (const [key, value] of attempts)
        if (value.until < now) attempts.delete(key);
    next();
  });
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const { email, password } = credentials(req.body);
      const name = String(req.body.name || "").trim();
      if (!name || name.length > 80)
        throw new Error("Enter your name (up to 80 characters).");
      if (registry.prepare("SELECT id FROM Accounts WHERE email=?").get(email))
        return res.status(409).json({
          error: "An account with this email already exists. Sign in instead.",
        });
      const salt = randomBytes(16).toString("hex");
      const passwordHash = (await scrypt(password, salt, 64)).toString("hex");
      const account = { id: randomUUID(), email, name };
      const database = accountDatabase(account.id);
      databaseContext.run({ database, account: publicAccount(account) }, () => {
        seed();
        db.prepare("UPDATE Profiles SET name=?").run(name);
      });
      registry
        .prepare("INSERT INTO Accounts VALUES (?,?,?,?,?,?)")
        .run(
          account.id,
          email,
          name,
          passwordHash,
          salt,
          new Date().toISOString(),
        );
      session(req, res, account);
      databaseContext.run({ database, account: publicAccount(account) }, () =>
        res.json({ state: getState(), newAccount: true }),
      );
    } catch (error) {
      next(error);
    }
  });
  app.post("/api/auth/login", async (req, res, next) => {
    try {
      const { email, password } = credentials(req.body);
      const account = registry
        .prepare("SELECT * FROM Accounts WHERE email=?")
        .get(email);
      const derived = await scrypt(
        password,
        account?.salt || "unregistered-account-salt",
        64,
      );
      if (
        !account ||
        !timingSafeEqual(derived, Buffer.from(account.password_hash, "hex"))
      )
        return res
          .status(401)
          .json({ error: "Email or password is incorrect." });
      session(req, res, account);
      databaseContext.run(
        {
          database: accountDatabase(account.id),
          account: publicAccount(account),
        },
        () => res.json({ state: getState() }),
      );
    } catch (error) {
      next(error);
    }
  });
  app.post("/api/auth/logout", (req, res) => {
    const token = tokenFrom(req);
    if (token)
      registry
        .prepare("DELETE FROM Sessions WHERE token_hash=?")
        .run(hash(token));
    cookie(req, res, "", 0);
    databaseContext.run(null, () => res.json({ state: getState() }));
  });
  app.post("/api/auth/password", async (req, res, next) => {
    try {
      const account = databaseContext.getStore()?.account;
      if (!account)
        return res
          .status(401)
          .json({ error: "Sign in to change your password." });
      const row = registry
        .prepare("SELECT * FROM Accounts WHERE id=?")
        .get(account.id);
      const current = String(req.body.currentPassword || "");
      if (current.length > 128) throw new Error("Invalid password.");
      const derived = await scrypt(current, row.salt, 64);
      if (!timingSafeEqual(derived, Buffer.from(row.password_hash, "hex")))
        return res
          .status(401)
          .json({ error: "Your current password is incorrect." });
      const { password } = credentials({
        email: row.email,
        password: req.body.password,
      });
      const salt = randomBytes(16).toString("hex");
      const passwordHash = (await scrypt(password, salt, 64)).toString("hex");
      registry.transaction(() => {
        registry
          .prepare("UPDATE Accounts SET password_hash=?,salt=? WHERE id=?")
          .run(passwordHash, salt, row.id);
        registry.prepare("DELETE FROM Sessions WHERE account_id=?").run(row.id);
      })();
      session(req, res, row);
      res.json({ state: getState() });
    } catch (error) {
      next(error);
    }
  });
}
