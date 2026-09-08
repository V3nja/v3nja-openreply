import pg from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/openreply";
const pool = new pg.Pool({ connectionString });

async function main() {
  console.log("Updating campaigns with Follow-to-Unlock Gating & Story triggers...");

  // Update NJALA STREAMING CAMPAIGN with follow-gating & story reply
  await pool.query(`
    UPDATE "Automation"
    SET
      "requireFollow" = true,
      "followPromptMessage" = 'Yo fam! 🔥 You need to follow @v3nja2.0 to unlock the exclusive NJALA streaming smart link. Hit Follow on @v3nja2.0, then tap below!',
      "followPromptButtonLabel" = '✅ I Follow @v3nja2.0 — Unlock NJALA',
      "followUpEnabled" = true,
      "followUpMessage" = 'Hope you enjoy NJALA! 🎧 Let me know your favourite verse on your IG story & tag @v3nja2.0 ❤️',
      "dmTriggerEnabled" = true
    WHERE "name" = 'NJALA STREAMING CAMPAIGN'
  `);

  // Update VIP campaign with follow-gating
  await pool.query(`
    UPDATE "Automation"
    SET
      "requireFollow" = true,
      "followPromptMessage" = 'VIP Pass is reserved for active followers of @v3nja2.0! Hit follow on our profile, then unlock your VIP invite below 🌍👑',
      "followPromptButtonLabel" = '⚡ Unlock V3NJA VIP Pass',
      "dmTriggerEnabled" = true
    WHERE "name" = 'V3NJA WRLD VIP / INNER CIRCLE'
  `);

  console.log("✓ Successfully enabled Follow-Gating & Story Triggers for V3NJA!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
