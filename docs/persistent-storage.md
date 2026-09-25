# Keeping your data

Ascend already uses a server-side SQLite database. Progress is saved automatically after a successful action; refreshing the page or closing your browser does not erase it. Sign in to use the same account on another browser or device connected to the same server.

## Local use

Run `npm run dev` as usual. Existing databases remain in `backend/data/`; this change does not move or reset them. The path is now resolved from the application directory, so launching the server from a different working directory no longer creates an empty workspace elsewhere.

## Deploy from the GitHub repository

The included Docker Compose configuration builds both the website and API:

```bash
docker compose up -d --build
```

Open **http://localhost:3001**. The `ascend-data` named volume stores the local workspace, account registry, sessions, and every account database under `/data`. Rebuilding the image or recreating its container reuses that volume:

```bash
git pull
docker compose up -d --build
```

Docker volumes persist independently of containers. See [Docker's volume documentation](https://docs.docker.com/engine/storage/volumes/).

For public access, put the app behind an HTTPS reverse proxy. Set `COOKIE_SECURE=true` in your Compose `.env`. The default published port is bound to localhost; configure `APP_BIND_ADDRESS` if your proxy needs a different binding. AI environment variables remain optional.

**Keep the volume when stopping the app.** `docker compose down` preserves it; `docker compose down --volumes` deletes stored data. A volume protects against container replacement, not loss of the host disk. Keep backups on another disk or service.

GitHub hosts the source code, not this database. GitHub Pages cannot run the Node.js API. No external server or cloud database has been provisioned by adding these files.

### Other hosting providers

Attach a persistent disk and point **`DATA_DIR`** at its mount path, for example:

```bash
DATA_DIR=/var/lib/ascend HOST=0.0.0.0 PORT=3001 npm start
```

Both the workspace and account databases follow `DATA_DIR`. Advanced `DATABASE_PATH` and `ACCOUNTS_PATH` overrides take precedence; if you use them, both must also point at persistent storage. An ephemeral filesystem will still lose its files on redeployment. Run one app instance against the disk; do not share SQLite WAL files across independent hosts/network filesystems.

## Back up and restore

Create a database backup while the app is running:

```bash
npm run db:backup -- /absolute/path/to/new-backup-folder
```

The command uses SQLite's backup API, including committed writes in WAL files. It snapshots the local database, the account registry, then the databases listed in that registry. Each file is a consistent SQLite snapshot; the whole collection is not a single simultaneous snapshot. A completed backup contains `manifest.json`. Existing backup directories are never overwritten.

In Docker:

```bash
docker compose exec app npm run db:backup -- /data/backups/my-backup
mkdir -p backups
docker compose cp app:/data/backups/my-backup ./backups/my-backup
```

Store the copied backup privately outside the host. It contains account password hashes, sessions and personal progress. Settings' JSON export is useful for inspecting progress, but the database backup is what restores complete accounts.

To test a restore without overwriting existing data, stop the server and launch it with `DATA_DIR` pointing at a complete backup folder:

```bash
DATA_DIR=/absolute/path/to/my-backup npm start
```

Leave `DATABASE_PATH` and `ACCOUNTS_PATH` unset so they use the restored folder. For Docker, copy the restored folder's contents into a new persistent volume before starting the app. Keep the original volume until the restore is verified.

### Move your existing local data into Docker

Docker starts with a separate volume; it does not automatically import your current local profile. To preserve existing accounts:

1. Stop making changes to the local app and create a backup with `npm run db:backup -- backups/migration`.
2. Run `docker compose create` to create the container and volume without starting the app.
3. Copy the databases into the new volume:

   ```bash
   docker compose cp backups/migration/. app:/data
   docker compose run --rm --no-deps --user root app chown -R node:node /data
   docker compose start
   ```

4. Sign in and verify your progress. Keep the original local databases and backup.

## Verification

`npm test` includes a persistence test that creates an account, saves profile changes, skills, quests, XP, goals and chat, kills the server, then starts it from a different directory against the same disk. It also creates and restores a backup and checks that the account can still sign in.
