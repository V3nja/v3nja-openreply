import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getCurrentWorkspaceId } from "@/lib/auth";
import { getDMQueue } from "@/lib/queue/client";
import { getWorkerHealth } from "@/lib/ops/worker-health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const [account, queueCounts, workerHealth, webhookFailures, dmFailures, operationalEvents] = await Promise.all([
      prisma.instagramAccount.findFirst({
        where: { workspaceId },
        orderBy: { connectedAt: "asc" },
        select: { instagramId: true, username: true, webhookSubscribed: true, connectedAt: true, updatedAt: true },
      }),
      getDMQueue().getJobCounts("waiting", "active", "delayed", "failed"),
      getWorkerHealth(),
      prisma.webhookEvent.findMany({
        where: { workspaceId, status: "FAILED" },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, object: true, errorMessage: true, createdAt: true },
      }),
      prisma.dmLog.findMany({
        where: { workspaceId, status: "FAILED" },
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
      }),
      prisma.operationalEvent.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        take: 12,
        select: { id: true, source: true, level: true, message: true, createdAt: true, resolvedAt: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        metaApiStatus: {
          connected: Boolean(account),
          account: account?.username ? `@${account.username}` : "Not connected",
          accountId: account?.instagramId ?? "",
          graphApiVersion: process.env.META_GRAPH_API_VERSION || "v25.0",
          webhookSubscribed: account?.webhookSubscribed ?? false,
          connectedAt: account?.connectedAt ?? null,
          updatedAt: account?.updatedAt ?? null,
        },
        queueCounts: queueCounts || { waiting: 0, active: 0, delayed: 0, failed: 0 },
        workerHealth: {
          healthy: workerHealth.healthy,
          ageMs: workerHealth.ageMs,
          heartbeat: workerHealth.heartbeat,
        },
        workerAlerts: [],
        webhookFailures,
        dmFailures,
        tokenRefreshFailures: [],
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
