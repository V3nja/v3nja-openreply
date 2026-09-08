import DashboardShell from "@/components/dashboard-shell";
import { getCurrentUserId, getCurrentWorkspaceId } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userId, workspaceId] = await Promise.all([
    getCurrentUserId(),
    getCurrentWorkspaceId(),
  ]);

  const [workspace, accountCount, firstAccount] = workspaceId
    ? await Promise.all([
        prisma.workspace.findUnique({ where: { id: workspaceId }, select: { name: true } }),
        prisma.instagramAccount.count({ where: { workspaceId } }),
        prisma.instagramAccount.findFirst({
          where: { workspaceId },
          select: { username: true },
          orderBy: { connectedAt: "asc" },
        }),
      ])
    : [null, 0, null];

  return (
    <DashboardShell
      workspaceName={workspace?.name ?? "V3NJA WRLD"}
      instagramUsername={firstAccount?.username ?? null}
      instagramAccountCount={accountCount}
    >
      {children}
    </DashboardShell>
  );
}
