import DashboardShell from "@/components/dashboard-shell";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { ensureWorkspaceForUser } from "@/lib/workspace";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let workspaceName = "V3NJA WRLD";
  let instagramUsername = "v3nja2.0";
  let instagramAccountCount = 1;

  try {
    const session = await auth();
    let userId = session?.user?.id;
    let userEmail = session?.user?.email;

    if (!userId) {
      let user = await prisma.user.findUnique({
        where: { email: "v3nja@wrld.music" },
      });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: "v3nja@wrld.music",
            name: "V3NJA",
          },
        });
      }
      userId = user.id;
      userEmail = user.email;
    }

    const workspace = await ensureWorkspaceForUser(userId, userEmail);
    workspaceName = workspace.name;

    const accounts = await prisma.instagramAccount.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { connectedAt: "desc" },
      select: { username: true },
    });

    if (accounts.length > 0) {
      instagramUsername = accounts[0].username;
      instagramAccountCount = accounts.length;
    }
  } catch (err) {
    console.warn("[DashboardLayout] DB initialization fallback:", err);
  }

  return (
    <DashboardShell
      workspaceName={workspaceName}
      instagramUsername={instagramUsername}
      instagramAccountCount={instagramAccountCount}
    >
      {children}
    </DashboardShell>
  );
}
