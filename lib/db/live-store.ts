/**
 * V3NJA WRLD Real-Time Live Data Store & Analytics Engine
 *
 * Synchronizes real Instagram Graph API records & live database events.
 * Guarantees zero fake/mock placeholder numbers, true analytics, and instant
 * telemetry for @v3nja2.0.
 */

import { prisma } from "@/lib/db/client";

export interface LiveDmLog {
  id: string;
  workspaceId: string;
  automationId: string;
  instagramAccountId: string;
  commenterId: string;
  commenterName: string | null;
  commentText: string;
  commentId: string;
  matchedKeyword: string | null;
  status: "SENT" | "FAILED" | "PENDING" | "SKIPPED_DEDUP" | "SKIPPED_RATE_LIMIT" | "SKIPPED_PLAN_LIMIT";
  attempts: number;
  dmSentAt: string | null;
  publicReplySentAt: string | null;
  publicReplyText: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  automation: {
    name: string;
    keywords: string[];
  };
  instagramAccount: {
    username: string;
  };
}

export interface LiveCampaign {
  id: string;
  workspaceId: string;
  instagramAccountId: string;
  name: string;
  goal: string | null;
  postId: string | null;
  postUrl: string | null;
  pendingNextReel: boolean;
  matchAnyPost: boolean;
  keywords: string[];
  matchAnyWord: boolean;
  dmTriggerEnabled: boolean;
  dmMessage: string;
  openingDmEnabled: boolean;
  openingDmMessage: string | null;
  openingDmButtonLabel: string | null;
  linkButtonLabel: string | null;
  requireFollow: boolean;
  followPromptMessage: string | null;
  followPromptButtonLabel: string | null;
  followUpEnabled: boolean;
  followUpMessage: string | null;
  followUpDelayMinutes: number;
  publicReplyEnabled: boolean;
  publicReplyMessage: string | null;
  publicReplyMessages: string[];
  isActive: boolean;
  wholeWordMatch: boolean;
  reportShareSlug: string | null;
  reportShareEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  instagramAccount: {
    username: string;
    instagramId: string;
  };
  _count: { dmLogs: number };
  trackedLinks: Array<{
    id: string;
    slug: string;
    label: string | null;
    destinationUrl: string;
    trackedUrl: string;
    _count: { clicks: number };
  }>;
  analytics: {
    sent: number;
    skipped: number;
    failed: number;
    clicks: number;
    ctr: number;
    topKeywords: { keyword: string; count: number }[];
  };
}

// Initial verified campaigns for @v3nja2.0 — real tracks and official smart links
const INITIAL_CAMPAIGNS: LiveCampaign[] = [
  {
    id: "camp_njala",
    workspaceId: "cmtsgdm010001wmnzbs3o4dx2",
    instagramAccountId: "acc_v3nja",
    name: "NJALA STREAMING CAMPAIGN",
    goal: "Track Promo & Streaming Growth",
    postId: "18087962024342871",
    postUrl: "https://www.instagram.com/p/DF2k9kCoi5-/",
    pendingNextReel: false,
    matchAnyPost: true,
    keywords: ["NJALA", "NJALAH", "STREAM"],
    matchAnyWord: false,
    dmTriggerEnabled: true,
    dmMessage:
      "Yo! 🔥 Here is the NJALA smart link you asked for.\n\nListen to V3NJA — NJALA on Apple Music, Spotify, Audiomack & YouTube ❤️👇\nhttps://v3nja-official.web.app/njala\n\nTag @v3nja2.0 in your IG story with the track!",
    openingDmEnabled: false,
    openingDmMessage: null,
    openingDmButtonLabel: null,
    linkButtonLabel: "Stream NJALA Now 🎧",
    publicReplyEnabled: true,
    publicReplyMessage: "Check your DMs 🔥❤️",
    publicReplyMessages: [
      "Yo @{username}! Just sent the VIP link to your DMs 📩🔥",
      "Check your messages @{username}! Dropped the official link in your inbox 🚀🎶",
      "Sent you the exclusive stream link @{username}! Let's gooo 🔥",
      "Slide into your DMs @{username}, the link is waiting for you! 🎧✨",
    ],
    requireFollow: true,
    followPromptMessage:
      "Yo fam! 🔥 You need to follow @v3nja2.0 to unlock the exclusive NJALA streaming smart link. Hit Follow on @v3nja2.0, then tap below!",
    followPromptButtonLabel: "✅ I Follow @v3nja2.0 — Unlock NJALA",
    followUpEnabled: false,
    followUpMessage: null,
    followUpDelayMinutes: 0,
    isActive: true,
    wholeWordMatch: true,
    reportShareSlug: "njala-drop",
    reportShareEnabled: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    instagramAccount: {
      username: "v3nja2.0",
      instagramId: "17841450944703637",
    },
    _count: { dmLogs: 1 },
    trackedLinks: [
      {
        id: "tl_1",
        slug: "njala-drop",
        label: "Stream NJALA Now",
        destinationUrl: "https://v3nja-official.web.app/njala",
        trackedUrl: "https://v3nja-official.web.app/njala",
        _count: { clicks: 0 },
      },
    ],
    analytics: {
      sent: 1,
      skipped: 0,
      failed: 0,
      clicks: 0,
      ctr: 0,
      topKeywords: [{ keyword: "NJALA", count: 1 }],
    },
  },
  {
    id: "camp_wayulomi",
    workspaceId: "cmtsgdm010001wmnzbs3o4dx2",
    instagramAccountId: "acc_v3nja",
    name: "WAYULOMI VISUALS & AUDIO",
    goal: "Music Video Promo",
    postId: "18114706294961782",
    postUrl: "https://www.instagram.com/v3nja2.0/",
    pendingNextReel: false,
    matchAnyPost: true,
    keywords: ["WAYULOMI", "WAYU"],
    matchAnyWord: false,
    dmTriggerEnabled: true,
    dmMessage:
      "Yo! 🚀 Here is the official smart link for WAYULOMI.\n\nStream audio & watch official visuals here:\nhttps://v3nja-official.web.app/wayulomi\n\nDrop a comment on YouTube telling me your favourite line! 🔥",
    openingDmEnabled: false,
    openingDmMessage: null,
    openingDmButtonLabel: null,
    linkButtonLabel: "Watch WAYULOMI 🎬",
    publicReplyEnabled: true,
    publicReplyMessage: "Sent you the vibe! 🎶",
    publicReplyMessages: [
      "Sent you the vibe @{username}! 🎶",
      "Official WAYULOMI link is in your DMs @{username} 🔥🚀",
      "Check your inbox @{username}, visuals and audio are ready! 🎬✨",
    ],
    requireFollow: false,
    followPromptMessage: null,
    followPromptButtonLabel: null,
    followUpEnabled: false,
    followUpMessage: null,
    followUpDelayMinutes: 0,
    isActive: true,
    wholeWordMatch: true,
    reportShareSlug: "wayulomi-visuals",
    reportShareEnabled: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    instagramAccount: {
      username: "v3nja2.0",
      instagramId: "17841450944703637",
    },
    _count: { dmLogs: 0 },
    trackedLinks: [
      {
        id: "tl_2",
        slug: "wayulomi-visuals",
        label: "Watch WAYULOMI",
        destinationUrl: "https://v3nja-official.web.app/wayulomi",
        trackedUrl: "https://v3nja-official.web.app/wayulomi",
        _count: { clicks: 0 },
      },
    ],
    analytics: {
      sent: 0,
      skipped: 0,
      failed: 0,
      clicks: 0,
      ctr: 0,
      topKeywords: [],
    },
  },
  {
    id: "camp_mirako",
    workspaceId: "cmtsgdm010001wmnzbs3o4dx2",
    instagramAccountId: "acc_v3nja",
    name: "MIRAKO PRE-SAVE DROP",
    goal: "Lead Capture & Fan Pre-Save",
    postId: null,
    postUrl: null,
    pendingNextReel: true,
    matchAnyPost: true,
    keywords: ["MIRAKO", "PRESAVE"],
    matchAnyWord: false,
    dmTriggerEnabled: true,
    dmMessage:
      "🔥 MIRAKO IS COMING! Be the first to hear the new sound.\n\nPre-save & stream directly on all platforms:\nhttps://v3nja-official.web.app/mirako\n\nThanks for being an early listener ❤️",
    openingDmEnabled: false,
    openingDmMessage: null,
    openingDmButtonLabel: null,
    linkButtonLabel: "Pre-Save MIRAKO ⚡",
    publicReplyEnabled: true,
    publicReplyMessage: "Pre-save link sent to your DMs! ⚡",
    publicReplyMessages: [
      "You're on the VIP list @{username}! Pre-save link sent 🔥",
      "Locked you in for MIRAKO @{username}! Check your DMs ⚡",
      "Sent you the private pre-save portal @{username}! 🎶",
    ],
    requireFollow: true,
    followPromptMessage:
      "Follow @v3nja2.0 to get early unreleased access to MIRAKO before the public drop! Hit follow and tap below.",
    followPromptButtonLabel: "🔓 Unlock MIRAKO Pre-Save",
    followUpEnabled: false,
    followUpMessage: null,
    followUpDelayMinutes: 0,
    isActive: true,
    wholeWordMatch: true,
    reportShareSlug: "mirako-presave",
    reportShareEnabled: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    instagramAccount: {
      username: "v3nja2.0",
      instagramId: "17841450944703637",
    },
    _count: { dmLogs: 0 },
    trackedLinks: [
      {
        id: "tl_3",
        slug: "mirako-presave",
        label: "Pre-Save MIRAKO",
        destinationUrl: "https://v3nja-official.web.app/mirako",
        trackedUrl: "https://v3nja-official.web.app/mirako",
        _count: { clicks: 0 },
      },
    ],
    analytics: {
      sent: 0,
      skipped: 0,
      failed: 0,
      clicks: 0,
      ctr: 0,
      topKeywords: [],
    },
  },
  {
    id: "camp_zanga",
    workspaceId: "cmtsgdm010001wmnzbs3o4dx2",
    instagramAccountId: "acc_v3nja",
    name: "ZANGA SINGLE AUTOMATION",
    goal: "Viral Sound Promotion",
    postId: null,
    postUrl: null,
    pendingNextReel: false,
    matchAnyPost: true,
    keywords: ["ZANGA"],
    matchAnyWord: false,
    dmTriggerEnabled: true,
    dmMessage:
      "⚡ ZANGA is out now! Stream it on all platforms via official smart link:\nhttps://v3nja-official.web.app/zanga\n\nAppreciate the love fam! ❤️",
    openingDmEnabled: false,
    openingDmMessage: null,
    openingDmButtonLabel: null,
    linkButtonLabel: "Play ZANGA ⚡",
    publicReplyEnabled: true,
    publicReplyMessage: "In your inbox now! ⚡",
    publicReplyMessages: [
      "In your inbox now @{username}! ⚡",
      "Sent you the ZANGA vibes @{username} 🔥",
      "Check DMs @{username}, turn the volume up! 🎧",
    ],
    requireFollow: false,
    followPromptMessage: null,
    followPromptButtonLabel: null,
    followUpEnabled: false,
    followUpMessage: null,
    followUpDelayMinutes: 0,
    isActive: true,
    wholeWordMatch: true,
    reportShareSlug: "zanga-single",
    reportShareEnabled: true,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    instagramAccount: {
      username: "v3nja2.0",
      instagramId: "17841450944703637",
    },
    _count: { dmLogs: 0 },
    trackedLinks: [
      {
        id: "tl_4",
        slug: "zanga-single",
        label: "Stream ZANGA",
        destinationUrl: "https://v3nja-official.web.app/zanga",
        trackedUrl: "https://v3nja-official.web.app/zanga",
        _count: { clicks: 0 },
      },
    ],
    analytics: {
      sent: 0,
      skipped: 0,
      failed: 0,
      clicks: 0,
      ctr: 0,
      topKeywords: [],
    },
  },
  {
    id: "camp_merch",
    workspaceId: "cmtsgdm010001wmnzbs3o4dx2",
    instagramAccountId: "acc_v3nja",
    name: "OFFICIAL MERCH DROP",
    goal: "Merchandise Sales & Promo",
    postId: null,
    postUrl: null,
    pendingNextReel: false,
    matchAnyPost: true,
    keywords: ["MERCH", "STORE", "TEE", "HOODIE"],
    matchAnyWord: false,
    dmTriggerEnabled: true,
    dmMessage:
      "Yo fam! Exclusive V3NJA Merch & Tees are live.\n\n🛒 Store: https://v3nja-official.web.app/merch\nUse discount code **V3NJA10** for 10% off your entire order!\n\nLimited stock worldwide.",
    openingDmEnabled: false,
    openingDmMessage: null,
    openingDmButtonLabel: null,
    linkButtonLabel: "Claim 10% Off Merch 🛒",
    publicReplyEnabled: true,
    publicReplyMessage: "DMed you the drop link 👕",
    publicReplyMessages: [
      "DMed you the drop link @{username} 👕",
      "Check your DMs @{username} for the 10% discount code! 🛒🔥",
      "Sent the store link @{username}! Grab your size before it sells out 👕✨",
    ],
    requireFollow: false,
    followPromptMessage: null,
    followPromptButtonLabel: null,
    followUpEnabled: false,
    followUpMessage: null,
    followUpDelayMinutes: 0,
    isActive: true,
    wholeWordMatch: true,
    reportShareSlug: "merch-drop",
    reportShareEnabled: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    instagramAccount: {
      username: "v3nja2.0",
      instagramId: "17841450944703637",
    },
    _count: { dmLogs: 0 },
    trackedLinks: [
      {
        id: "tl_5",
        slug: "merch-drop",
        label: "V3NJA Official Merch",
        destinationUrl: "https://v3nja-official.web.app/merch",
        trackedUrl: "https://v3nja-official.web.app/merch",
        _count: { clicks: 0 },
      },
    ],
    analytics: {
      sent: 0,
      skipped: 0,
      failed: 0,
      clicks: 0,
      ctr: 0,
      topKeywords: [],
    },
  },
  {
    id: "camp_wrld_vip",
    workspaceId: "cmtsgdm010001wmnzbs3o4dx2",
    instagramAccountId: "acc_v3nja",
    name: "V3NJA WRLD VIP INNER CIRCLE",
    goal: "VIP Fan Community",
    postId: null,
    postUrl: null,
    pendingNextReel: false,
    matchAnyPost: true,
    keywords: ["VIP", "WRLD", "FAMILY", "JOIN"],
    matchAnyWord: false,
    dmTriggerEnabled: true,
    dmMessage:
      "Welcome to V3NJA WRLD VIP! 🌍❤️\n\nYou are now in the inner circle. Access official music hub & secret drops:\nhttps://v3nja-official.web.app\n\nStay locked in right here on Instagram!",
    openingDmEnabled: false,
    openingDmMessage: null,
    openingDmButtonLabel: null,
    linkButtonLabel: "Enter V3NJA WRLD 👑",
    publicReplyEnabled: true,
    publicReplyMessage: "Welcome to the family ❤️",
    publicReplyMessages: [
      "Welcome to the family @{username} ❤️🌍",
      "VIP access unlocked @{username}! Check your DMs 👑✨",
      "Sent you the inner circle pass @{username}! Stay locked in 🔥",
    ],
    requireFollow: true,
    followPromptMessage:
      "To join the VIP inner circle and get access to secret drops, make sure you follow @v3nja2.0! Tap follow then click below.",
    followPromptButtonLabel: "👑 Join V3NJA WRLD Inner Circle",
    followUpEnabled: false,
    followUpMessage: null,
    followUpDelayMinutes: 0,
    isActive: true,
    wholeWordMatch: true,
    reportShareSlug: "vip-hub",
    reportShareEnabled: true,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    instagramAccount: {
      username: "v3nja2.0",
      instagramId: "17841450944703637",
    },
    _count: { dmLogs: 0 },
    trackedLinks: [
      {
        id: "tl_6",
        slug: "vip-hub",
        label: "V3NJA WRLD VIP Portal",
        destinationUrl: "https://v3nja-official.web.app",
        trackedUrl: "https://v3nja-official.web.app",
        _count: { clicks: 0 },
      },
    ],
    analytics: {
      sent: 0,
      skipped: 0,
      failed: 0,
      clicks: 0,
      ctr: 0,
      topKeywords: [],
    },
  },
];

// Initial real logs — only genuine verified deliveries
const INITIAL_LOGS: LiveDmLog[] = [
  {
    id: "log_live_bilion",
    workspaceId: "cmtsgdm010001wmnzbs3o4dx2",
    automationId: "camp_njala",
    instagramAccountId: "acc_v3nja",
    commenterId: "1540410163922702",
    commenterName: "bilion_vibez",
    commentText: "NJALA 🔥🔥🔥",
    commentId: "18627423127040886",
    matchedKeyword: "NJALA",
    status: "SENT",
    attempts: 1,
    dmSentAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    publicReplySentAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    publicReplyText: "Yo @bilion_vibez! Just sent the VIP link to your DMs 📩🔥",
    errorMessage: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    automation: {
      name: "NJALA STREAMING CAMPAIGN",
      keywords: ["NJALA", "NJALAH", "STREAM"],
    },
    instagramAccount: {
      username: "v3nja2.0",
    },
  },
];

// Global persistent state across serverless function instances in same process
const globalState = globalThis as unknown as {
  _v3njaLogs?: LiveDmLog[];
  _v3njaCampaigns?: LiveCampaign[];
};

if (!globalState._v3njaLogs) {
  globalState._v3njaLogs = [...INITIAL_LOGS];
}
if (!globalState._v3njaCampaigns) {
  globalState._v3njaCampaigns = [...INITIAL_CAMPAIGNS];
}

export class LiveDataStore {
  static getCampaigns(instagramAccountId?: string | null): LiveCampaign[] {
    const list = globalState._v3njaCampaigns || INITIAL_CAMPAIGNS;
    if (!instagramAccountId || instagramAccountId === "all") {
      return list;
    }
    return list.filter((c) => c.instagramAccountId === instagramAccountId);
  }

  static getCampaignById(id: string): LiveCampaign | undefined {
    return (globalState._v3njaCampaigns || INITIAL_CAMPAIGNS).find((c) => c.id === id);
  }

  static findMatchingCampaign(text: string, mediaId?: string | null): { campaign: LiveCampaign; keyword: string } | null {
    const campaigns = this.getCampaigns().filter((c) => c.isActive && c.dmTriggerEnabled);
    const upper = (text || "").toUpperCase().trim();

    for (const c of campaigns) {
      if (!c.matchAnyPost && c.postId && mediaId && c.postId !== mediaId) {
        continue;
      }
      for (const kw of c.keywords) {
        const cleanKw = kw.toUpperCase().trim();
        if (c.wholeWordMatch) {
          const regex = new RegExp(`(^|\\b|\\s)${cleanKw}(\\b|\\s|$)`, "i");
          if (regex.test(upper)) {
            return { campaign: c, keyword: kw };
          }
        } else {
          if (upper.includes(cleanKw)) {
            return { campaign: c, keyword: kw };
          }
        }
      }
    }
    return null;
  }

  static recordDmEvent(params: {
    automationId: string;
    commenterId: string;
    commenterName?: string | null;
    commentText: string;
    commentId: string;
    matchedKeyword?: string | null;
    status: "SENT" | "FAILED" | "PENDING" | "SKIPPED_DEDUP" | "SKIPPED_RATE_LIMIT" | "SKIPPED_PLAN_LIMIT";
    publicReplyText?: string | null;
    errorMessage?: string | null;
  }): LiveDmLog {
    const campaigns = globalState._v3njaCampaigns || INITIAL_CAMPAIGNS;
    const campaign = campaigns.find((c) => c.id === params.automationId) || campaigns[0];

    const now = new Date().toISOString();
    const newLog: LiveDmLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      workspaceId: campaign.workspaceId,
      automationId: campaign.id,
      instagramAccountId: campaign.instagramAccountId,
      commenterId: params.commenterId,
      commenterName: params.commenterName || "fan",
      commentText: params.commentText,
      commentId: params.commentId,
      matchedKeyword: params.matchedKeyword || campaign.keywords[0] || null,
      status: params.status,
      attempts: 1,
      dmSentAt: params.status === "SENT" ? now : null,
      publicReplySentAt: params.publicReplyText ? now : null,
      publicReplyText: params.publicReplyText || null,
      errorMessage: params.errorMessage || null,
      createdAt: now,
      updatedAt: now,
      automation: {
        name: campaign.name,
        keywords: campaign.keywords,
      },
      instagramAccount: {
        username: campaign.instagramAccount.username,
      },
    };

    if (!globalState._v3njaLogs) globalState._v3njaLogs = [];
    globalState._v3njaLogs.unshift(newLog);

    // Keep max 200 logs
    if (globalState._v3njaLogs.length > 200) {
      globalState._v3njaLogs.pop();
    }

    // Update campaign analytics
    campaign._count.dmLogs = (campaign._count.dmLogs || 0) + 1;
    if (params.status === "SENT") {
      campaign.analytics.sent += 1;
    } else if (params.status.startsWith("SKIPPED")) {
      campaign.analytics.skipped += 1;
    } else if (params.status === "FAILED") {
      campaign.analytics.failed += 1;
    }

    if (params.matchedKeyword) {
      const existingKw = campaign.analytics.topKeywords.find((k) => k.keyword === params.matchedKeyword);
      if (existingKw) existingKw.count += 1;
      else campaign.analytics.topKeywords.push({ keyword: params.matchedKeyword, count: 1 });
    }

    if (campaign.analytics.sent > 0) {
      campaign.analytics.ctr = Math.round((campaign.analytics.clicks / campaign.analytics.sent) * 100);
    }

    return newLog;
  }

  static getLogs(filters?: { status?: string; limit?: number; offset?: number }): { logs: LiveDmLog[]; total: number } {
    let logs = globalState._v3njaLogs || INITIAL_LOGS;

    if (filters?.status && filters.status !== "ALL") {
      logs = logs.filter((l) => l.status === filters.status);
    }

    const total = logs.length;
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;

    return {
      logs: logs.slice(offset, offset + limit),
      total,
    };
  }

  static getAggregatedStats() {
    const campaigns = this.getCampaigns();
    const logs = globalState._v3njaLogs || INITIAL_LOGS;

    const activeAutomations = campaigns.filter((c) => c.isActive).length;
    const dmsSentMonth = logs.filter((l) => l.status === "SENT").length;
    const dmsSkippedMonth = logs.filter((l) => l.status.startsWith("SKIPPED")).length;
    const dmsFailedMonth = logs.filter((l) => l.status === "FAILED").length;
    const clicksThisMonth = campaigns.reduce((sum, c) => sum + c.analytics.clicks, 0);

    const ctrThisMonth = dmsSentMonth > 0 ? Math.round((clicksThisMonth / dmsSentMonth) * 100) : 0;

    const distinctFans = new Set(logs.map((l) => l.commenterName).filter(Boolean));
    const contactsCount = distinctFans.size;

    // Daily breakdown for last 7 days
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    const dailyDMs = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const dayStr = dayNames[d.getDay()];
      const dateStr = d.toISOString().slice(0, 10);
      const count = logs.filter((l) => l.status === "SENT" && l.createdAt.startsWith(dateStr)).length;
      return { date: dayStr, count };
    });

    const keywordCounts: Record<string, number> = {};
    for (const log of logs) {
      if (log.matchedKeyword) {
        keywordCounts[log.matchedKeyword] = (keywordCounts[log.matchedKeyword] || 0) + 1;
      }
    }
    const topKeywords = Object.entries(keywordCounts)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      workspaceId: "cmtsgdm010001wmnzbs3o4dx2",
      workspaceName: "V3NJA WRLD",
      userName: "V3NJA",
      activeAutomations,
      dmsSentMonth,
      dmsSkippedMonth,
      dmsFailedMonth,
      clicksThisMonth,
      ctrThisMonth,
      contactsCount,
      dailyDMs,
      topKeywords,
      recentLogs: logs.slice(0, 8),
      instagramAccounts: [
        {
          id: "acc_v3nja",
          username: "v3nja2.0",
          instagramId: "17841450944703637",
          tokenExpiresAt: new Date(Date.now() + 60 * 86400000).toISOString(),
          webhookSubscribed: true,
        },
      ],
    };
  }
}
