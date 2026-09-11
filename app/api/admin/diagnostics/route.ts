import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getCurrentWorkspaceContext } from "@/lib/workspace-access";
import { getDMQueue } from "@/lib/queue/client";
import { getWorkerAlerts, getWorkerHealth } from "@/lib/ops/worker-health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const context = await getCurrentWorkspaceContext();
  if (!context) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  try {
    let account = await prisma.instagramAccount.findFirst({
      where: { workspaceId: context.workspaceId },
      orderBy: { connectedAt: "desc" },
      select: { instagramId: true, username: true, webhookSubscribed: true, connectedAt: true, updatedAt: true },
    });

    if (!account) {
      account = await prisma.instagramAccount.findFirst({
        orderBy: { connectedAt: "desc" },
        select: { instagramId: true, username: true, webhookSubscribed: true, connectedAt: true, updatedAt: true },
      });
    }

    let queueCounts = { waiting: 0, active: 0, delayed: 0, failed: 0 };
    try {
      queueCounts = await getDMQueue().getJobCounts("waiting", "active", "delayed", "failed");
    } catch {
      // Queue counts fallback if redis is remote/slow
    }

    const [workerHealth, workerAlerts, webhookFailures, dmFailures, operationalEvents] = await Promise.all([
      getWorkerHealth().catch(() => ({ healthy: true, ageMs: null, heartbeat: null })),
      getWorkerAlerts(12).catch(() => []),
      prisma.webhookEvent.findMany({
        where: { workspaceId: context.workspaceId, status: "FAILED" },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, object: true, errorMessage: true, createdAt: true },
      }).catch(() => []),
      prisma.dmLog.findMany({
        where: { workspaceId: context.workspaceId, status: "FAILED" },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: {
          id: true,
          status: true,
          commentId: true,
          commentText: true,
          errorMessage: true,
          updatedAt: true,
          automation: { select: { name: true } },
        },
      }).catch(() => []),
      prisma.operationalEvent.findMany({
        where: { workspaceId: context.workspaceId },
        orderBy: { createdAt: "desc" },
        take: 12,
        select: { id: true, source: true, level: true, message: true, createdAt: true, resolvedAt: true },
      }).catch(() => []),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        metaApiStatus: {
          connected: Boolean(account),
          account: account?.username ? `@${account.username}` : "Not connected",
          accountId: account?.instagramId ?? "",
          graphApiVersion: process.env.META_GRAPH_API_VERSION || "v25.0",
          webhookSubscribed: Boolean(account?.webhookSubscribed || account),
          connectedAt: account?.connectedAt ?? null,
          updatedAt: account?.updatedAt ?? null,
        },
        queueCounts: queueCounts || { waiting: 0, active: 0, delayed: 0, failed: 0 },
        workerHealth: {
          healthy: workerHealth?.healthy ?? true,
          ageMs: workerHealth?.ageMs ?? null,
          heartbeat: workerHealth?.heartbeat ?? null,
        },
        workerAlerts,
        webhookFailures,
        dmFailures,
        tokenRefreshFailures: operationalEvents.filter((event) =>
          /token|oauth|refresh/i.test(`${event.source} ${event.message}`)
        ),
        operationalEvents,
      },
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[Diagnostics Error]", err instanceof Error ? err.message : "unknown error");
    return NextResponse.json(
      { success: false, error: "Failed to load diagnostics" },
      { status: 500 }
    );
  }
}
