import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

// Resolve defaults from the application, not the directory it was launched in.
// Keeping the legacy filenames preserves existing local installations.
export const appRoot = fileURLToPath(new URL("../", import.meta.url));
export function storagePaths(env = process.env) {
  const dataDirectory = resolve(appRoot, env.DATA_DIR || "backend/data");
  const databasePath = env.DATABASE_PATH
    ? resolve(appRoot, env.DATABASE_PATH)
    : resolve(dataDirectory, "ascend.db");
  const accountsPath = env.ACCOUNTS_PATH
    ? resolve(appRoot, env.ACCOUNTS_PATH)
    : `${databasePath}.accounts`;
  return { dataDirectory, databasePath, accountsPath };
}
export const storage = storagePaths();
