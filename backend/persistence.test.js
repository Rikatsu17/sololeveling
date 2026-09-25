import test from "node:test";
import assert from "node:assert/strict";
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtempSync, mkdirSync, rmSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { appRoot, storagePaths } from "./storage.js";
const execute = promisify(execFile);

test("storage paths preserve existing data and keep accounts on the configured disk", () => {
  assert.equal(
    storagePaths({}).databasePath,
    resolve(appRoot, "backend/data/ascend.db"),
  );
  const custom = storagePaths({ DATA_DIR: "/var/lib/ascend" });
  assert.equal(custom.databasePath, "/var/lib/ascend/ascend.db");
  assert.equal(custom.accountsPath, "/var/lib/ascend/ascend.db.accounts");
  const overrides = storagePaths({
    DATA_DIR: "/disk",
    DATABASE_PATH: "custom/old.db",
    ACCOUNTS_PATH: "custom/accounts",
  });
  assert.equal(overrides.databasePath, resolve(appRoot, "custom/old.db"));
  assert.equal(overrides.accountsPath, resolve(appRoot, "custom/accounts"));
});

test(
  "account, sessions and progress survive a crash, restart and database backup restore",
  { timeout: 30000 },
  async (t) => {
    const directory = mkdtempSync(join(tmpdir(), "ascend-persistence-"));
    const dataDir = join(directory, "persistent-disk");
    const firstRelease = join(directory, "release-one"),
      secondRelease = join(directory, "release-two");
    mkdirSync(firstRelease);
    mkdirSync(secondRelease);
    const port = 45000 + Math.floor(Math.random() * 10000);
    const environment = {
      ...process.env,
      PORT: String(port),
      HOST: "127.0.0.1",
      DATA_DIR: dataDir,
      DATABASE_PATH: "",
      ACCOUNTS_PATH: "",
      AI_API_KEY: "",
      COOKIE_SECURE: "false",
    };
    let server;
    async function stop(signal = "SIGTERM") {
      if (!server || server.exitCode !== null || server.signalCode !== null)
        return;
      const stopped = new Promise((r) => server.once("exit", r));
      server.kill(signal);
      await stopped;
    }
    t.after(async () => {
      await stop();
      rmSync(directory, { recursive: true, force: true });
    });
    async function start(cwd, env = environment) {
      server = spawn(process.execPath, [join(appRoot, "backend/server.js")], {
        cwd,
        env,
      });
      await new Promise((done, reject) => {
        let output = "";
        const timeout = setTimeout(
          () => reject(new Error(`Server did not start: ${output}`)),
          10000,
        );
        server.stdout.on("data", (d) => {
          output += d;
          if (output.includes("API ready")) {
            clearTimeout(timeout);
            done();
          }
        });
        server.stderr.on("data", (d) => {
          output += d;
        });
        server.once("error", (e) => {
          clearTimeout(timeout);
          reject(e);
        });
        server.once("exit", () => {
          clearTimeout(timeout);
          reject(new Error(`Server exited: ${output}`));
        });
      });
    }
    let cookie;
    async function request(path, method = "GET", body) {
      const response = await fetch(`http://127.0.0.1:${port}/api${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(cookie ? { Cookie: cookie } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const result = await response.json();
      assert.equal(response.status, 200, JSON.stringify(result));
      if (response.headers.get("set-cookie"))
        cookie = response.headers.get("set-cookie").split(";")[0];
      return result;
    }
    await start(firstRelease);
    await request("/auth/register", "POST", {
      name: "Persistent learner",
      email: "saved@example.test",
      password: "persistent-password",
    });
    const initial = await request("/onboarding", "POST", {
      name: "Persistent learner",
      goal: "Keep learning",
      skills: "Programming",
      experience: 5,
      daily_minutes: 45,
    });
    const skill = initial.skills[0];
    await request("/profile", "PATCH", {
      bio: "This should still be here after restarting.",
    });
    await request("/quests", "POST", {
      title: "Finish tomorrow",
      minutes: 25,
      xp: 40,
    });
    await request("/log/confirm", "POST", {
      title: "Implemented persistent storage",
      minutes: 60,
      xp: 100,
      skillId: skill.id,
      statIds: ["career", "focus"],
    });
    await request("/chat", "POST", { message: "What should I work on today?" });
    const before = await request("/state");
    assert.equal(before.profile.totalXp, initial.profile.totalXp + 100);
    await stop("SIGKILL"); // Exercise WAL recovery, not just a clean shutdown.
    await start(secondRelease);
    const after = await request("/state");
    for (const key of [
      "account",
      "profile",
      "skills",
      "stats",
      "quests",
      "goals",
      "transactions",
      "completions",
      "conversations",
      "daily",
    ])
      assert.deepEqual(
        after[key],
        before[key],
        `${key} did not survive restart`,
      );
    const backupDir = join(directory, "snapshot");
    const backup = await execute(
      process.execPath,
      [join(appRoot, "scripts/backup.mjs"), backupDir],
      { cwd: secondRelease, env: environment },
    );
    assert.match(backup.stdout, /Backup complete: 3 databases/);
    const manifest = JSON.parse(
      readFileSync(join(backupDir, "manifest.json"), "utf8"),
    );
    assert.equal(manifest.files.length, 3);
    await stop();
    await start(secondRelease, { ...environment, DATA_DIR: backupDir });
    const restored = await request("/state");
    assert.deepEqual(restored.profile, before.profile);
    assert.deepEqual(restored.transactions, before.transactions);
    assert.deepEqual(restored.goals, before.goals);
    await request("/auth/logout", "POST", {});
    const login = await request("/auth/login", "POST", {
      email: "saved@example.test",
      password: "persistent-password",
    });
    assert.equal(login.state.profile.totalXp, before.profile.totalXp);
  },
);
