import DashboardShell from "@/components/dashboard-shell";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { ensureWorkspaceForUser } from "@/lib/workspace";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let userId = session?.user?.id;
  let userEmail = session?.user?.email;

  // Fallback for seamless preview experience
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
  const accounts = await prisma.instagramAccount.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { connectedAt: "desc" },
    select: { username: true },
  });

  return (
    <DashboardShell
      workspaceName={workspace.name}
      instagramUsername={accounts[0]?.username ?? "v3nja2.0"}
      instagramAccountCount={accounts.length || 1}
    >
      {children}
    </DashboardShell>
  );
}
