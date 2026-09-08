import pg from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/openreply";
const pool = new pg.Pool({ connectionString });

async function main() {
  console.log("Setting production token and real Instagram ID for @v3nja2.0...");

  await pool.query(`
    UPDATE "InstagramAccount"
    SET
      "instagramId" = '17841450944703637',
      "username" = 'v3nja2.0',
      "name" = 'V3NJA Official (@v3nja2.0)',
      "accessToken" = '1283029104898866|NXSXQuDYiNgo84tvoyLI9zgfg5E',
      "webhookSubscribed" = true
    WHERE "username" = 'v3nja2.0' OR "instagramId" = '17841400000000001' OR "instagramId" = '17841450944703637';
  `);

  console.log("✓ Live production token and @v3nja2.0 saved!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
