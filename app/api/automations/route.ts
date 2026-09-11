import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import {
  canManageWorkspace,
  getCurrentWorkspaceContext,
} from "@/lib/workspace-access";
import { generateTrackedLinkSlug } from "@/lib/tracking/server";
import { buildTrackedUrl } from "@/lib/tracking/message";
import { buildReportUrl, generateReportShareSlug } from "@/lib/reports/share";

export const dynamic = "force-dynamic";

const MAX_NAME = 100;
const MAX_MESSAGE = 5000;
const MAX_KEYWORDS = 100;
const MAX_KEYWORD = 100;
const MAX_FOLLOW_UP_DELAY = 7 * 24 * 60;

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function boundedText(value: unknown, max: number, fallback = "") {
  return text(value, fallback).slice(0, max);
}

function keywords(value: unknown) {
  if (!Array.isArray(value)) return ["MUSIC"];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, MAX_KEYWORD))
    .filter(Boolean)
    .slice(0, MAX_KEYWORDS);
}

function parseDelay(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(MAX_FOLLOW_UP_DELAY, Math.max(0, Math.floor(parsed)));
}

function parseDestination(value: unknown) {
  const raw = text(value);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

async function ownedAccount(workspaceId: string, instagramAccountId: string) {
  return prisma.instagramAccount.findFirst({
    where: { id: instagramAccountId, workspaceId },
    select: { id: true, username: true, instagramId: true },
  });
}

async function campaignForResponse(id: string, workspaceId: string) {
  const campaign = await prisma.automation.findFirst({
    where: { id, workspaceId },
    include: {
      instagramAccount: {
        select: { username: true, instagramId: true },
      },
      trackedLinks: {
        include: { _count: { select: { clicks: true } } },
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: { dmLogs: true },
      },
    },
  });

  if (!campaign) return null;

  const [statusGroups, clickCount, keywordGroups] = await Promise.all([
    prisma.dmLog.groupBy({
      by: ["status"],
      where: { automationId: campaign.id, workspaceId },
      _count: { _all: true },
    }),
    prisma.linkClick.count({
      where: { automationId: campaign.id, workspaceId },
    }),
    prisma.dmLog.groupBy({
      by: ["matchedKeyword"],
      where: {
        automationId: campaign.id,
        workspaceId,
        matchedKeyword: { not: null },
      },
      _count: { _all: true },
      orderBy: { _count: { matchedKeyword: "desc" } },
      take: 5,
    }),
  ]);

  const sent = statusGroups.find((group) => String(group.status) === "SENT")?._count._all ?? 0;
  const skipped = statusGroups
    .filter((group) => String(group.status).startsWith("SKIPPED_"))
    .reduce((sum, group) => sum + group._count._all, 0);
  const failed = statusGroups.find((group) => String(group.status) === "FAILED")?._count._all ?? 0;

  return {
    ...campaign,
    _count: {
      dmLogs: campaign._count?.dmLogs ?? sent + skipped + failed,
    },
    instagramAccountUsername: campaign.instagramAccount?.username ?? "",
    analytics: {
      sent,
      skipped,
      failed,
      clicks: clickCount,
      ctr: sent > 0 ? Number(((clickCount / sent) * 100).toFixed(1)) : 0,
      topKeywords: keywordGroups
        .filter((group) => group.matchedKeyword)
        .map((group) => ({ keyword: group.matchedKeyword, count: group._count._all })),
    },
    reportUrl: campaign.reportShareSlug ? buildReportUrl(campaign.reportShareSlug) : null,
    trackedLinks: (campaign.trackedLinks ?? []).map((link) => ({
      ...link,
      trackedUrl: buildTrackedUrl(link.slug),
    })),
  };
}

async function campaignsForResponse(ids: string[], workspaceId: string) {
  return Promise.all(ids.map((id) => campaignForResponse(id, workspaceId)));
}

const createData = (
  body: Record<string, unknown>,
  instagramAccountId: string,
  workspaceId: string
) => ({
  workspaceId,
  instagramAccountId,
  name: boundedText(body.name, MAX_NAME, "Untitled Campaign"),
  goal: boundedText(body.goal, MAX_MESSAGE) || null,
  postId: boundedText(body.postId, 500) || null,
  postUrl: boundedText(body.postUrl, 2000) || null,
  pendingNextReel: Boolean(body.pendingNextReel),
  matchAnyPost: Boolean(body.matchAnyPost),
  keywords: keywords(body.keywords),
  matchAnyWord: Boolean(body.matchAnyWord),
  dmTriggerEnabled: Boolean(body.dmTriggerEnabled),
  dmMessage: boundedText(
    body.dmMessage,
    MAX_MESSAGE,
    "Thanks for commenting! Here is the link:"
  ),
  openingDmEnabled: Boolean(body.openingDmEnabled),
  openingDmMessage: boundedText(body.openingDmMessage, MAX_MESSAGE) || null,
  openingDmButtonLabel: boundedText(body.openingDmButtonLabel, 100) || null,
  linkButtonLabel: boundedText(body.linkButtonLabel, 100, "Open link") || "Open link",
  requireFollow: Boolean(body.requireFollow),
  followPromptMessage: boundedText(body.followPromptMessage, MAX_MESSAGE) || null,
  followPromptButtonLabel: boundedText(body.followPromptButtonLabel, 100) || null,
  followUpEnabled: Boolean(body.followUpEnabled),
  followUpMessage: boundedText(body.followUpMessage, MAX_MESSAGE) || null,
  followUpDelayMinutes: parseDelay(body.followUpDelayMinutes),
  publicReplyEnabled: Boolean(body.publicReplyEnabled),
  publicReplyMessages:
    Array.isArray(body.publicReplyMessages) && body.publicReplyMessages.length > 0
      ? body.publicReplyMessages
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim().slice(0, MAX_MESSAGE))
          .filter(Boolean)
          .slice(0, 20)
      : ["Check your DMs @{username} 🔥"],
  isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
  wholeWordMatch: body.wholeWordMatch !== undefined ? Boolean(body.wholeWordMatch) : true,
  reportShareSlug: generateReportShareSlug(),
});

const allowedUpdateKeys = [
  "name",
  "goal",
  "postId",
  "postUrl",
  "pendingNextReel",
  "matchAnyPost",
  "keywords",
  "matchAnyWord",
  "dmTriggerEnabled",
  "dmMessage",
  "openingDmEnabled",
  "openingDmMessage",
  "openingDmButtonLabel",
  "linkButtonLabel",
  "requireFollow",
  "followPromptMessage",
  "followPromptButtonLabel",
  "followUpEnabled",
  "followUpMessage",
  "followUpDelayMinutes",
  "publicReplyEnabled",
  "publicReplyMessages",
  "isActive",
  "wholeWordMatch",
  "reportShareEnabled",
] as const;

function updateData(body: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  for (const key of allowedUpdateKeys) {
    if (body[key] === undefined) continue;
    switch (key) {
      case "name":
        data[key] = boundedText(body[key], MAX_NAME, "Untitled Campaign");
        break;
      case "goal":
      case "dmMessage":
      case "openingDmMessage":
      case "followPromptMessage":
      case "followUpMessage":
        data[key] = boundedText(body[key], MAX_MESSAGE) || null;
        if (key === "dmMessage" && !data[key]) {
          data[key] = "Thanks for commenting! Here is the link:";
        }
        break;
      case "postId":
        data[key] = boundedText(body[key], 500) || null;
        break;
      case "postUrl":
        data[key] = boundedText(body[key], 2000) || null;
        break;
      case "openingDmButtonLabel":
      case "linkButtonLabel":
      case "followPromptButtonLabel":
        data[key] = boundedText(body[key], 100) || null;
        break;
      case "keywords":
        data[key] = keywords(body[key]);
        break;
      case "publicReplyMessages":
        data[key] = Array.isArray(body[key])
          ? body[key]
              .filter((item): item is string => typeof item === "string")
              .map((item) => item.trim().slice(0, MAX_MESSAGE))
              .filter(Boolean)
              .slice(0, 20)
          : [];
        break;
      case "followUpDelayMinutes":
        data[key] = parseDelay(body[key]);
        break;
      default:
        data[key] = Boolean(body[key]);
    }
  }
  return data;
}

async function syncTrackedLinks(
  automationId: string,
  workspaceId: string,
  body: Record<string, unknown>
) {
  const primary = parseDestination(body.trackedDestinationUrl);
  const secondary = parseDestination(body.secondaryDestinationUrl);
  const desired = [
    primary
      ? {
          destinationUrl: primary,
          label: boundedText(body.linkButtonLabel, 100, "Open link") || "Open link",
        }
      : null,
    secondary
      ? {
          destinationUrl: secondary,
          label: boundedText(body.secondaryButtonLabel, 100, "Open link") || "Open link",
        }
      : null,
  ];

  await prisma.$transaction(async (tx) => {
    const links = await tx.trackedLink.findMany({
      where: { automationId, workspaceId },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    for (let index = 0; index < desired.length; index += 1) {
      const next = desired[index];
      const current = links[index];
      if (next && current) {
        await tx.trackedLink.update({
          where: { id: current.id },
          data: next,
        });
      } else if (next) {
        await tx.trackedLink.create({
          data: {
            workspaceId,
            automationId,
            slug: generateTrackedLinkSlug(),
            ...next,
          },
        });
      }
    }

    for (const link of links.slice(desired.length)) {
      await tx.trackedLink.delete({ where: { id: link.id } });
    }

    for (let index = desired.length; index < Math.min(links.length, desired.length); index += 1) {
      const current = links[index];
      if (current && !desired[index]) {
        await tx.trackedLink.delete({ where: { id: current.id } });
      }
    }
  });
}

export async function GET(request: NextRequest) {
  const context = await getCurrentWorkspaceContext();
  if (!context) return errorResponse("Unauthorized", 401);

  try {
    const accountId = request.nextUrl.searchParams.get("instagramAccountId");
    if (accountId && accountId !== "all") {
      const account = await ownedAccount(context.workspaceId, accountId);
      if (!account) return errorResponse("Instagram account not found", 404);
    }

    const automations = await prisma.automation.findMany({
      where: {
        workspaceId: context.workspaceId,
        ...(accountId && accountId !== "all" ? { instagramAccountId: accountId } : {}),
      },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });

    const data = (
      await campaignsForResponse(
        automations.map((item) => item.id),
        context.workspaceId
      )
    ).filter(Boolean);

    return NextResponse.json(
      { success: true, data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[Automations GET Error]", error);
    return errorResponse("Failed to load campaigns", 500);
  }
}

export async function POST(request: NextRequest) {
  const context = await getCurrentWorkspaceContext();
  if (!context) return errorResponse("Unauthorized", 401);
  if (!canManageWorkspace(context.role)) return errorResponse("Forbidden", 403);

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const requestedAccountId = text(body.instagramAccountId) || text(body.instagramAccount);

    let instagramAccountId = requestedAccountId;
    if (!instagramAccountId) {
      const account = await prisma.instagramAccount.findFirst({
        where: { workspaceId: context.workspaceId },
        orderBy: { connectedAt: "asc" },
        select: { id: true },
      });
      instagramAccountId = account?.id ?? "";
    }

    if (!instagramAccountId) return errorResponse("Connect an Instagram account first", 400);
    if (!(await ownedAccount(context.workspaceId, instagramAccountId))) {
      return errorResponse("Instagram account not found", 404);
    }

    const destinationUrl = parseDestination(body.trackedDestinationUrl);
    const secondaryDestinationUrl = parseDestination(body.secondaryDestinationUrl);
    const linkCreates = [
      destinationUrl
        ? {
            workspaceId: context.workspaceId,
            slug: generateTrackedLinkSlug(),
            label: boundedText(body.linkButtonLabel, 100, "Open link") || "Open link",
            destinationUrl,
          }
        : null,
      secondaryDestinationUrl
        ? {
            workspaceId: context.workspaceId,
            slug: generateTrackedLinkSlug(),
            label:
              boundedText(body.secondaryButtonLabel, 100, "Open link") || "Open link",
            destinationUrl: secondaryDestinationUrl,
          }
        : null,
    ].filter(Boolean) as Array<{
      workspaceId: string;
      slug: string;
      label: string;
      destinationUrl: string;
    }>;

    const created = await prisma.automation.create({
      data: {
        ...createData(body, instagramAccountId, context.workspaceId),
        ...(linkCreates.length ? { trackedLinks: { create: linkCreates } } : {}),
      },
      select: { id: true },
    });

    const data = await campaignForResponse(created.id, context.workspaceId);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("[Automations POST Error]", error);
    return errorResponse("Failed to create campaign", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const context = await getCurrentWorkspaceContext();
  if (!context) return errorResponse("Unauthorized", 401);
  if (!canManageWorkspace(context.role)) return errorResponse("Forbidden", 403);

  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return errorResponse("Campaign ID is required", 400);

    const body = (await request.json()) as Record<string, unknown>;
    const existing = await prisma.automation.findFirst({
      where: { id, workspaceId: context.workspaceId },
      select: { id: true },
    });
    if (!existing) return errorResponse("Campaign not found", 404);

    const updated = await prisma.automation.update({
      where: { id },
      data: updateData(body),
      select: { id: true },
    });

    if (
      body.trackedDestinationUrl !== undefined ||
      body.secondaryDestinationUrl !== undefined ||
      body.linkButtonLabel !== undefined ||
      body.secondaryButtonLabel !== undefined
    ) {
      await syncTrackedLinks(id, context.workspaceId, body);
    }

    const data = await campaignForResponse(updated.id, context.workspaceId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[Automations PATCH Error]", error);
    return errorResponse("Failed to update campaign", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const context = await getCurrentWorkspaceContext();
  if (!context) return errorResponse("Unauthorized", 401);
  if (!canManageWorkspace(context.role)) return errorResponse("Forbidden", 403);

  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return errorResponse("Campaign ID is required", 400);

    const existing = await prisma.automation.findFirst({
      where: { id, workspaceId: context.workspaceId },
      select: { id: true },
    });
    if (!existing) return errorResponse("Campaign not found", 404);

    await prisma.automation.delete({ where: { id } });
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error("[Automations DELETE Error]", error);
    return errorResponse("Failed to delete campaign", 500);
  }
}
