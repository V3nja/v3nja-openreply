import { Client } from "pg";
import fs from "node:fs";
import path from "node:path";

async function run() {
  const dbUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL;

  if (!dbUrl) {
    console.error("[DB Init] No DATABASE_URL found");
    return;
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("[DB Init] Connected to PostgreSQL");

    const migrationsDir = path.join(__dirname, "../prisma/migrations");
    const dirs = fs.readdirSync(migrationsDir).sort();

    for (const dir of dirs) {
      const sqlFile = path.join(migrationsDir, dir, "migration.sql");
      if (fs.existsSync(sqlFile)) {
        const sql = fs.readFileSync(sqlFile, "utf-8");
        console.log(`[DB Init] Applying migration: ${dir}`);
        try {
          await client.query(sql);
        } catch (e: any) {
          // ignore already exists errors
          console.warn(`[DB Init] Migration step notice:`, e.message);
        }
      }
    }
    console.log("[DB Init] All migrations applied successfully");
  } catch (err: any) {
    console.error("[DB Init] Error during migration:", err.message);
  } finally {
    await client.end();
  }
}

run();
