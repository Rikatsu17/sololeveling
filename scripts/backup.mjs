import Database from "better-sqlite3";
import { existsSync, mkdirSync, chmodSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { storage } from "../backend/storage.js";

// SQLite's backup API includes committed data still in the WAL.
// Never copy a live .db file alone: recent writes may be in its -wal file.
const destination = resolve(
  process.argv[2] || `backups/${new Date().toISOString().replaceAll(":", "-")}`,
);
if (existsSync(destination))
  throw new Error(
    "Choose a new backup directory; existing backups will not be overwritten.",
  );
if (!existsSync(storage.databasePath))
  throw new Error(
    "Database not found. Start Ascend once, or check DATA_DIR/DATABASE_PATH.",
  );
mkdirSync(destination, { recursive: true, mode: 0o700 });
const files = [];
async function snapshot(source, relative) {
  if (!existsSync(source)) throw new Error(`Database missing: ${source}`);
  const database = new Database(source, {
    readonly: true,
    fileMustExist: true,
  });
  try {
    const target = join(destination, relative);
    await database.backup(target);
    chmodSync(target, 0o600);
    files.push(relative);
  } finally {
    database.close();
  }
}
try {
  await snapshot(storage.databasePath, "ascend.db");
  const registryPath = join(storage.accountsPath, "registry.db");
  if (existsSync(registryPath)) {
    mkdirSync(join(destination, "ascend.db.accounts"), { mode: 0o700 });
    await snapshot(registryPath, "ascend.db.accounts/registry.db");
    const registry = new Database(
      join(destination, "ascend.db.accounts/registry.db"),
      { readonly: true },
    );
    let accounts;
    try {
      accounts = registry.prepare("SELECT id FROM Accounts").all();
    } finally {
      registry.close();
    }
    for (const { id } of accounts) {
      if (!/^[a-f0-9-]{36}$/.test(id))
        throw new Error("Invalid account ID in registry.");
      await snapshot(
        join(storage.accountsPath, `${id}.db`),
        `ascend.db.accounts/${id}.db`,
      );
    }
  }
  writeFileSync(
    join(destination, "manifest.json"),
    JSON.stringify(
      { version: 1, completedAt: new Date().toISOString(), files },
      null,
      2,
    ),
    { mode: 0o600 },
  );
  console.log(
    `Backup complete: ${files.length} databases saved to ${destination}`,
  );
} catch (error) {
  console.error(
    `Backup incomplete: ${error.message}. Do not use a backup without manifest.json.`,
  );
  process.exitCode = 1;
}
