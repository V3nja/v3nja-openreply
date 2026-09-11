import { prisma } from "../lib/db/client";
import { encryptToken } from "../lib/meta/oauth";

async function main() {
  console.log("[Seed] Checking @v3nja2.0 connection...");

  const workspace = await prisma.workspace.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!workspace) {
    console.log("[Seed] No workspace found yet.");
    return;
  }

  const token =
    process.env.META_PAGE_ACCESS_TOKEN ||
    process.env.INSTAGRAM_ACCESS_TOKEN ||
    process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!token) {
    console.log("[Seed] No META_PAGE_ACCESS_TOKEN set in environment.");
    return;
  }

  let encryptedToken = token;
  try {
    encryptedToken = encryptToken(token);
  } catch {
    console.log("[Seed] Storing token directly");
  }

  const account = await prisma.instagramAccount.upsert({
    where: { instagramId: "17841450944703637" },
    create: {
      workspaceId: workspace.id,
      instagramId: "17841450944703637",
      username: "v3nja2.0",
      name: "V3NJA Official (@v3nja2.0)",
      accessToken: encryptedToken,
      webhookSubscribed: true,
    },
    update: {
      workspaceId: workspace.id,
      username: "v3nja2.0",
      name: "V3NJA Official (@v3nja2.0)",
      accessToken: encryptedToken,
      webhookSubscribed: true,
    },
  });

  console.log(`[Seed] Successfully connected @${account.username} to your workspace!`);
}

main()
  .catch((e) => {
    console.error("[Seed Error]", e);
  })
  .finally(async () => {
    process.exit(0);
  });
