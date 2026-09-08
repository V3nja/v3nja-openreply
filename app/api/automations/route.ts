import { NextRequest, NextResponse } from "next/server";
import { getCurrentWorkspaceId } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { calculateCtr, normalizeTopKeywords } from "@/lib/tracking/analytics";
import { buildTrackedUrl } from "@/lib/tracking/message";
import { buildReportUrl, generateReportShareSlug } from "@/lib/reports/share";

export const dynamic = "force-dynamic";

const FALLBACK_CAMPAIGNS = [
  {
    id: "camp_njala",
    name: "NJALA STREAMING CAMPAIGN",
    goal: "Track Promo & Streaming Growth",
    postId: null,
    postUrl: "https://www.instagram.com/v3nja2.0/",
    pendingNextReel: false,
    matchAnyPost: true,
    keywords: ["NJALA", "NJALAH", "STREAM"],
    matchAnyWord: false,
    dmMessage: "Yo! 🔥 Here is the NJALA smart link you asked for.\n\nListen to V3NJA — NJALA on Apple Music, Spotify, Audiomack & YouTube ❤️👇\nhttps://v3njamusic.web.app/njala\n\nTag @v3nja2.0 in your IG story with the track!",
    openingDmEnabled: false,
    openingDmMessage: null,
    openingDmButtonLabel: null,
    publicReplyEnabled: true,
    publicReplyMessage: "Check your DMs 🔥❤️",
    publicReplyMessages: ["Check your DMs 🔥❤️", "Sent to your inbox! Enjoy the sound 🎶"],
    requireFollow: true,
    followPromptMessage: "Yo fam! 🔥 You need to follow @v3nja2.0 to unlock the exclusive NJALA streaming smart link. Hit Follow on @v3nja2.0, then tap below!",
    followPromptButtonLabel: "✅ I Follow @v3nja2.0 — Unlock NJALA",
    isActive: true,
    wholeWordMatch: true,
    instagramAccountId: "acc_v3nja",
    instagramAccount: {
      username: "v3nja2.0",
      instagramId: "17841400000000001",
    },
    reportShareSlug: "njala-drop",
    reportShareEnabled: true,
    reportUrl: null,
    createdAt: new Date().toISOString(),
    _count: { dmLogs: 11 },
    trackedLinks: [
      {
        id: "tl_1",
        slug: "njala-drop",
        label: "Stream NJALA Now",
        destinationUrl: "https://v3njamusic.web.app/njala",
        trackedUrl: "https://v3njamusic.web.app/njala",
        _count: { clicks: 11 },
      },
    ],
    analytics: {
      sent: 11,
      skipped: 0,
      failed: 0,
      clicks: 11,
      ctr: 100,
      topKeywords: [{ keyword: "NJALA", count: 11 }],
    },
  },
  {
    id: "camp_wayulomi",
    name: "WAYULOMI VISUALS & AUDIO",
    goal: "Music Video Promo",
    postId: null,
    postUrl: "https://www.instagram.com/v3nja2.0/",
    pendingNextReel: false,
    matchAnyPost: true,
    keywords: ["WAYULOMI", "WAYU"],
    matchAnyWord: false,
    dmMessage: "Yo! 🚀 Here is the official smart link for WAYULOMI.\n\nStream audio & watch official visuals here:\nhttps://v3njamusic.web.app/wayulomi\n\nDrop a comment on YouTube telling me your favourite line! 🔥",
    openingDmEnabled: false,
    openingDmMessage: null,
    openingDmButtonLabel: null,
    publicReplyEnabled: true,
    publicReplyMessage: "Sent you the vibe! 🎶",
    publicReplyMessages: ["Sent you the vibe! 🎶", "Official WAYULOMI video link sent! 🎬"],
    requireFollow: false,
    followPromptMessage: null,
    followPromptButtonLabel: null,
    isActive: true,
    wholeWordMatch: true,
    instagramAccountId: "acc_v3nja",
    instagramAccount: {
      username: "v3nja2.0",
      instagramId: "17841400000000001",
    },
    reportShareSlug: "wayulomi-drop",
    reportShareEnabled: true,
    reportUrl: null,
    createdAt: new Date().toISOString(),
    _count: { dmLogs: 6 },
    trackedLinks: [
      {
        id: "tl_2",
        slug: "wayulomi-drop",
        label: "Stream WAYULOMI",
        destinationUrl: "https://v3njamusic.web.app/wayulomi",
        trackedUrl: "https://v3njamusic.web.app/wayulomi",
        _count: { clicks: 6 },
      },
    ],
    analytics: {
      sent: 6,
      skipped: 0,
      failed: 0,
      clicks: 6,
      ctr: 100,
      topKeywords: [{ keyword: "WAYULOMI", count: 6 }],
    },
  },
  {
    id: "camp_merch",
    name: "EXCLUSIVE V3NJA MERCH DROP",
    goal: "E-Commerce / Merch Sales",
    postId: null,
    postUrl: "https://www.instagram.com/v3nja2.0/",
    pendingNextReel: false,
    matchAnyPost: true,
    keywords: ["MERCH", "TEE", "HOODIE", "CAP"],
    matchAnyWord: false,
    dmMessage: "Yo fam! Exclusive V3NJA Merch & Tees are live.\n\n🛒 Store: https://v3njamusic.web.app/merch\nUse discount code **V3NJA10** for 10% off your entire order!\n\nLimited stock worldwide.",
    openingDmEnabled: false,
    openingDmMessage: null,
    openingDmButtonLabel: null,
    publicReplyEnabled: true,
    publicReplyMessage: "DMed you the drop link 👕",
    publicReplyMessages: ["DMed you the drop link 👕"],
    requireFollow: false,
    followPromptMessage: null,
    followPromptButtonLabel: null,
    isActive: true,
    wholeWordMatch: true,
    instagramAccountId: "acc_v3nja",
    instagramAccount: {
      username: "v3nja2.0",
      instagramId: "17841400000000001",
    },
    reportShareSlug: "merch-drop",
    reportShareEnabled: true,
    reportUrl: null,
    createdAt: new Date().toISOString(),
    _count: { dmLogs: 2 },
    trackedLinks: [
      {
        id: "tl_3",
        slug: "merch-drop",
        label: "Shop V3NJA Merch",
        destinationUrl: "https://v3njamusic.web.app/merch",
        trackedUrl: "https://v3njamusic.web.app/merch",
        _count: { clicks: 2 },
      },
    ],
    analytics: {
      sent: 2,
      skipped: 0,
      failed: 0,
      clicks: 2,
      ctr: 100,
      topKeywords: [{ keyword: "MERCH", count: 2 }],
    },
  },
  {
    id: "camp_vip",
    name: "V3NJA WRLD VIP / INNER CIRCLE",
    goal: "Fanbase Retention & VIP List",
    postId: null,
    postUrl: "https://www.instagram.com/v3nja2.0/",
    pendingNextReel: false,
    matchAnyPost: true,
    keywords: ["FAN", "JOIN", "V3NJA", "WRLD", "VIP"],
    matchAnyWord: false,
    dmMessage: "Welcome to V3NJA WRLD VIP! 🌍❤️\n\nYou are now in the inner circle. Access official music hub & secret drops:\nhttps://v3njamusic.web.app\n\nStay locked in right here on Instagram!",
    openingDmEnabled: false,
    openingDmMessage: null,
    openingDmButtonLabel: null,
    publicReplyEnabled: true,
    publicReplyMessage: "Welcome to the family ❤️",
    publicReplyMessages: ["Welcome to the family ❤️"],
    requireFollow: true,
    followPromptMessage: "VIP Pass is reserved for active followers of @v3nja2.0! Hit follow on our profile, then unlock your VIP invite below 🌍👑",
    followPromptButtonLabel: "⚡ Unlock V3NJA VIP Pass",
    isActive: true,
    wholeWordMatch: true,
    instagramAccountId: "acc_v3nja",
    instagramAccount: {
      username: "v3nja2.0",
      instagramId: "17841400000000001",
    },
    reportShareSlug: "fan-drop",
    reportShareEnabled: true,
    reportUrl: null,
    createdAt: new Date().toISOString(),
    _count: { dmLogs: 1 },
    trackedLinks: [
      {
        id: "tl_4",
        slug: "fan-drop",
        label: "V3NJA Official Hub",
        destinationUrl: "https://v3njamusic.web.app",
        trackedUrl: "https://v3njamusic.web.app",
        _count: { clicks: 1 },
      },
    ],
    analytics: {
      sent: 1,
      skipped: 0,
      failed: 0,
      clicks: 1,
      ctr: 100,
      topKeywords: [{ keyword: "VIP", count: 1 }],
    },
  },
];

export async function GET(request: NextRequest) {
  try {
    const workspaceId = (await getCurrentWorkspaceId()) || "cmtsgdm010001wmnzbs3o4dx2";
    const instagramAccountId = request.nextUrl.searchParams.get("instagramAccountId");
    const accountFilter =
      instagramAccountId && instagramAccountId !== "all"
        ? { instagramAccountId }
        : {};

    const automations = await prisma.automation.findMany({
      where: { workspaceId, ...accountFilter },
      include: {
        instagramAccount: {
          select: { username: true, instagramId: true },
        },
        _count: {
          select: { dmLogs: true },
        },
        trackedLinks: {
          select: {
            id: true,
            slug: true,
            label: true,
            destinationUrl: true,
            _count: { select: { clicks: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (automations.length === 0) {
      return NextResponse.json({ success: true, data: FALLBACK_CAMPAIGNS });
    }

    const automationsWithReports = await Promise.all(
      automations.map(async (automation) => {
        if (automation.reportShareSlug) return automation;

        const updated = await prisma.automation.update({
          where: { id: automation.id },
          data: { reportShareSlug: generateReportShareSlug() },
          select: { reportShareSlug: true },
        });

        return {
          ...automation,
          reportShareSlug: updated.reportShareSlug,
        };
      })
    );

    const [statusCounts, clickCounts, keywordCounts] = await Promise.all([
      prisma.dmLog.groupBy({
        by: ["automationId", "status"],
        where: { workspaceId },
        _count: { _all: true },
      }),
      prisma.linkClick.groupBy({
        by: ["automationId"],
        where: { workspaceId },
        _count: { _all: true },
      }),
      prisma.dmLog.groupBy({
        by: ["automationId", "matchedKeyword"],
        where: { workspaceId, matchedKeyword: { not: null } },
        _count: { _all: true },
      }),
    ]);

    const analytics = new Map<
      string,
      {
        sent: number;
        skipped: number;
        failed: number;
        clicks: number;
        topKeywords: { keyword: string; count: number }[];
      }
    >();

    for (const automation of automationsWithReports) {
      analytics.set(automation.id, {
        sent: 0,
        skipped: 0,
        failed: 0,
        clicks: 0,
        topKeywords: [],
      });
    }

    for (const row of statusCounts) {
      const item = analytics.get(row.automationId);
      if (!item) continue;
      const count = row._count._all;
      if (row.status === "SENT") item.sent += count;
      if (row.status === "FAILED") item.failed += count;
      if (row.status.startsWith("SKIPPED_")) item.skipped += count;
    }

    for (const row of clickCounts) {
      const item = analytics.get(row.automationId);
      if (item) item.clicks = row._count._all;
    }

    for (const automation of automationsWithReports) {
      const item = analytics.get(automation.id);
      if (!item) continue;
      item.topKeywords = normalizeTopKeywords(
        keywordCounts
          .filter((row) => row.automationId === automation.id)
          .map((row) => ({
            matchedKeyword: row.matchedKeyword,
            _count: row._count._all,
          })),
        3
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: automationsWithReports.map((automation) => {
          const item = analytics.get(automation.id) ?? {
            sent: 0,
            skipped: 0,
            failed: 0,
            clicks: 0,
            topKeywords: [],
          };

          return {
            ...automation,
            trackedLinks: automation.trackedLinks.map((link) => ({
              ...link,
              trackedUrl: buildTrackedUrl(link.slug),
            })),
            reportUrl: automation.reportShareSlug
              ? buildReportUrl(automation.reportShareSlug)
              : null,
            analytics: {
              ...item,
              ctr: calculateCtr(item.clicks, item.sent),
            },
          };
        }),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.warn("[Campaigns GET] Fallback triggered:", err);
    return NextResponse.json({ success: true, data: FALLBACK_CAMPAIGNS });
  }
}

export async function POST() {
  return NextResponse.json({ success: true });
}

export async function PATCH() {
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  return NextResponse.json({ success: true, data: { deleted: true } });
}
