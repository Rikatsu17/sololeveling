import { rmSync } from "node:fs";
process.env.PORT = "3101";
process.env.DATABASE_PATH = "backend/data/e2e.db";
process.env.AI_API_KEY = "";
for (const suffix of ["", "-wal", "-shm"])
  rmSync(process.env.DATABASE_PATH + suffix, { force: true });
rmSync(`${process.env.DATABASE_PATH}.accounts`, {
  recursive: true,
  force: true,
});
await import("../backend/server.js");
