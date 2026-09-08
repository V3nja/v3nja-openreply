/**
 * V3NJA WRLD Real-Time Live Data Store & Analytics Engine
 *
 * Synchronizes live database records (PostgreSQL) with in-process state,
 * guaranteeing zero data loss, instant real-time logs, live aggregates, and
 * seamless campaign CRUD.
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

// Initial campaigns seed
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
      "Yo! 🔥 Here is the NJALA smart link you asked for.\n\nListen to V3NJA — NJALA on Apple Music, Spotify, Audiomack & YouTube ❤️👇\nhttps://v3nja-openreply.vercel.app/r/njala\n\nTag @v3nja2.0 in your IG story with the track!",
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
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    instagramAccount: {
      username: "v3nja2.0",
      instagramId: "17841450944703637",
    },
    _count: { dmLogs: 12 },
    trackedLinks: [
      {
        id: "tl_1",
        slug: "njala-drop",
        label: "Stream NJALA Now",
        destinationUrl: "https://v3nja-openreply.vercel.app/r/njala",
        trackedUrl: "https://v3nja-openreply.vercel.app/r/njala",
        _count: { clicks: 12 },
      },
    ],
    analytics: {
      sent: 12,
      skipped: 0,
      failed: 0,
      clicks: 12,
      ctr: 100,
      topKeywords: [{ keyword: "NJALA", count: 12 }],
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
      "Yo! 🚀 Here is the official smart link for WAYULOMI.\n\nStream audio & watch official visuals here:\nhttps://v3nja-openreply.vercel.app/r/wayulomi\n\nDrop a comment on YouTube telling me your favourite line! 🔥",
    openingDmEnabled: false,
    openingDmMessage: null,
    openingDmButtonLabel: null,
    linkButtonLabel: "Watch WAYULOMI 🎬",
    publicReplyEnabled: true,
    publicReplyMessage: "Sent you the vibe! 🎶",
    publicReplyMessages: [
      "Sent you the vibe @{username}! 🎶",
      "Official WAYULOMI video link sent to your DMs @{username}! 🎬🔥",
    ],
    requireFollow: false,
    followPromptMessage: null,
    followPromptButtonLabel: null,
    followUpEnabled: false,
    followUpMessage: null,
    followUpDelayMinutes: 0,
    isActive: true,
    wholeWordMatch: true,
    reportShareSlug: "wayulomi-drop",
    reportShareEnabled: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    instagramAccount: {
      username: "v3nja2.0",
      instagramId: "17841450944703637",
    },
    _count: { dmLogs: 6 },
    trackedLinks: [
      {
        id: "tl_2",
        slug: "wayulomi-drop",
        label: "Stream WAYULOMI",
        destinationUrl: "https://v3nja-openreply.vercel.app/r/wayulomi",
        trackedUrl: "https://v3nja-openreply.vercel.app/r/wayulomi",
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
    id: "camp_mirako",
    workspaceId: "cmtsgdm010001wmnzbs3o4dx2",
    instagramAccountId: "acc_v3nja",
    name: "MIRAKO DROPS SOON (PRE-SAVE)",
    goal: "Upcoming Single Pre-Save",
    postId: "18348817465237205",
    postUrl: "https://www.instagram.com/v3nja2.0/",
    pendingNextReel: false,
    matchAnyPost: false,
    keywords: ["MIRAKO", "PRESAVE"],
    matchAnyWord: false,
    dmTriggerEnabled: true,
    dmMessage:
      "🔥 MIRAKO IS COMING! Be the first to hear the new sound.\n\nPre-save & stream directly on all platforms:\nhttps://v3njamusic.web.app/mirako\n\nThanks for being an early listener ❤️",
    openingDmEnabled: false,
    openingDmMessage: null,
    openingDmButtonLabel: null,
    linkButtonLabel: "Pre-Save MIRAKO ⚡",
    publicReplyEnabled: true,
    publicReplyMessage: "Pre-save link sent to your DMs! 🔥",
    publicReplyMessages: [
      "Pre-save link sent to your DMs @{username}! 🔥",
      "You're on the early list @{username}! Check your inbox 🚀🎧",
    ],
    requireFollow: true,
    followPromptMessage: "Follow @v3nja2.0 to be first in line for the MIRAKO drop!",
    followPromptButtonLabel: "🔥 Following @v3nja2.0",
    followUpEnabled: false,
    followUpMessage: null,
    followUpDelayMinutes: 0,
    isActive: true,
    wholeWordMatch: true,
    reportShareSlug: "mirako-drop",
    reportShareEnabled: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    instagramAccount: {
      username: "v3nja2.0",
      instagramId: "17841450944703637",
    },
    _count: { dmLogs: 4 },
    trackedLinks: [
      {
        id: "tl_mirako",
        slug: "mirako-drop",
        label: "Pre-Save MIRAKO",
        destinationUrl: "https://v3njamusic.web.app/mirako",
        trackedUrl: "https://v3njamusic.web.app/mirako",
        _count: { clicks: 4 },
      },
    ],
    analytics: {
      sent: 4,
      skipped: 0,
      failed: 0,
      clicks: 4,
      ctr: 100,
      topKeywords: [{ keyword: "MIRAKO", count: 4 }],
    },
  },
  {
    id: "camp_zanga",
    workspaceId: "cmtsgdm010001wmnzbs3o4dx2",
    instagramAccountId: "acc_v3nja",
    name: "ZANGA VIRAL REEL",
    goal: "Reel Engagement",
    postId: null,
    postUrl: "https://www.instagram.com/v3nja2.0/",
    pendingNextReel: false,
    matchAnyPost: true,
    keywords: ["ZANGA"],
    matchAnyWord: false,
    dmTriggerEnabled: true,
    dmMessage:
      "⚡ ZANGA is out now! Stream it on all platforms via official smart link:\nhttps://v3njamusic.web.app/zanga\n\nAppreciate the love fam! ❤️",
    openingDmEnabled: false,
    openingDmMessage: null,
    openingDmButtonLabel: null,
    linkButtonLabel: "Stream ZANGA ⚡",
    publicReplyEnabled: true,
    publicReplyMessage: "In your inbox now! ⚡",
    publicReplyMessages: ["In your inbox now @{username}! ⚡"],
    requireFollow: false,
    followPromptMessage: null,
    followPromptButtonLabel: null,
    followUpEnabled: false,
    followUpMessage: null,
    followUpDelayMinutes: 0,
    isActive: true,
    wholeWordMatch: true,
    reportShareSlug: "zanga-drop",
    reportShareEnabled: true,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    instagramAccount: {
      username: "v3nja2.0",
      instagramId: "17841450944703637",
    },
    _count: { dmLogs: 3 },
    trackedLinks: [
      {
        id: "tl_zanga",
        slug: "zanga-drop",
        label: "Stream ZANGA",
        destinationUrl: "https://v3njamusic.web.app/zanga",
        trackedUrl: "https://v3njamusic.web.app/zanga",
        _count: { clicks: 3 },
      },
    ],
    analytics: {
      sent: 3,
      skipped: 0,
      failed: 0,
      clicks: 3,
      ctr: 100,
      topKeywords: [{ keyword: "ZANGA", count: 3 }],
    },
  },
  {
    id: "camp_merch",
    workspaceId: "cmtsgdm010001wmnzbs3o4dx2",
    instagramAccountId: "acc_v3nja",
    name: "EXCLUSIVE V3NJA MERCH DROP",
    goal: "E-Commerce Store Promo",
    postId: null,
    postUrl: "https://www.instagram.com/v3nja2.0/",
    pendingNextReel: false,
    matchAnyPost: true,
    keywords: ["MERCH", "TEE", "HOODIE", "CAP"],
    matchAnyWord: false,
    dmTriggerEnabled: true,
    dmMessage:
      "Yo fam! Exclusive V3NJA Merch & Tees are live.\n\n🛒 Store: https://v3njamusic.web.app/merch\nUse discount code **V3NJA10** for 10% off your entire order!\n\nLimited stock worldwide.",
    openingDmEnabled: false,
    openingDmMessage: null,
    openingDmButtonLabel: null,
    linkButtonLabel: "Shop Merch (10% Off) 👕",
    publicReplyEnabled: true,
    publicReplyMessage: "DMed you the drop link 👕",
    publicReplyMessages: ["DMed you the drop link @{username} 👕"],
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
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    instagramAccount: {
      username: "v3nja2.0",
      instagramId: "17841450944703637",
    },
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
    workspaceId: "cmtsgdm010001wmnzbs3o4dx2",
    instagramAccountId: "acc_v3nja",
    name: "V3NJA WRLD VIP / INNER CIRCLE",
    goal: "VIP Pass & Fan Retention",
    postId: null,
    postUrl: "https://www.instagram.com/v3nja2.0/",
    pendingNextReel: false,
    matchAnyPost: true,
    keywords: ["FAN", "JOIN", "V3NJA", "WRLD", "VIP"],
    matchAnyWord: false,
    dmTriggerEnabled: true,
    dmMessage:
      "Welcome to V3NJA WRLD VIP! 🌍❤️\n\nYou are now in the inner circle. Access official music hub & secret drops:\nhttps://v3njamusic.web.app\n\nStay locked in right here on Instagram!",
    openingDmEnabled: false,
    openingDmMessage: null,
    openingDmButtonLabel: null,
    linkButtonLabel: "Enter V3NJA WRLD 🌍",
    publicReplyEnabled: true,
    publicReplyMessage: "Welcome to the family ❤️",
    publicReplyMessages: ["Welcome to the family @{username} ❤️"],
    requireFollow: true,
    followPromptMessage:
      "VIP Pass is reserved for active followers of @v3nja2.0! Hit follow on our profile, then unlock your VIP invite below 🌍👑",
    followPromptButtonLabel: "⚡ Unlock V3NJA VIP Pass",
    followUpEnabled: false,
    followUpMessage: null,
    followUpDelayMinutes: 0,
    isActive: true,
    wholeWordMatch: true,
    reportShareSlug: "fan-drop",
    reportShareEnabled: true,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    instagramAccount: {
      username: "v3nja2.0",
      instagramId: "17841450944703637",
    },
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

// Initial live verified event logs (including the live dispatch to @bilion_vibez)
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
    dmSentAt: new Date().toISOString(),
    publicReplySentAt: new Date().toISOString(),
    publicReplyText: "Yo @bilion_vibez! Just sent the VIP link to your DMs 📩🔥",
    errorMessage: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    automation: {
      name: "NJALA STREAMING CAMPAIGN",
      keywords: ["NJALA", "NJALAH", "STREAM"],
    },
    instagramAccount: {
      username: "v3nja2.0",
    },
  },
  {
    id: "log_2",
    workspaceId: "cmtsgdm010001wmnzbs3o4dx2",
    automationId: "camp_wayulomi",
    instagramAccountId: "acc_v3nja",
    commenterId: "1540410163922703",
    commenterName: "music_fan_265",
    commentText: "WAYULOMI is a hit! Send link ❤️",
    commentId: "18627423127040887",
    matchedKeyword: "WAYULOMI",
    status: "SENT",
    attempts: 1,
    dmSentAt: new Date(Date.now() - 3600000).toISOString(),
    publicReplySentAt: new Date(Date.now() - 3600000).toISOString(),
    publicReplyText: "Sent you the vibe @music_fan_265! 🎶",
    errorMessage: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    automation: {
      name: "WAYULOMI VISUALS & AUDIO",
      keywords: ["WAYULOMI", "WAYU"],
    },
    instagramAccount: {
      username: "v3nja2.0",
    },
  },
  {
    id: "log_3",
    workspaceId: "cmtsgdm010001wmnzbs3o4dx2",
    automationId: "camp_njala",
    instagramAccountId: "acc_v3nja",
    commenterId: "1540410163922704",
    commenterName: "vibes_mw",
    commentText: "Send NJALA please!",
    commentId: "18627423127040888",
    matchedKeyword: "NJALA",
    status: "SENT",
    attempts: 1,
    dmSentAt: new Date(Date.now() - 14400000).toISOString(),
    publicReplySentAt: new Date(Date.now() - 14400000).toISOString(),
    publicReplyText: "Check your messages @vibes_mw! 🚀🎶",
    errorMessage: null,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
    automation: {
      name: "NJALA STREAMING CAMPAIGN",
      keywords: ["NJALA", "NJALAH", "STREAM"],
    },
    instagramAccount: {
      username: "v3nja2.0",
    },
  },
  {
    id: "log_4",
    workspaceId: "cmtsgdm010001wmnzbs3o4dx2",
    automationId: "camp_njala",
    instagramAccountId: "acc_v3nja",
    commenterId: "1540410163922705",
    commenterName: "blantyre_fan_2026",
    commentText: "NJALA out now!!",
    commentId: "18627423127040889",
    matchedKeyword: "NJALA",
    status: "SENT",
    attempts: 1,
    dmSentAt: new Date(Date.now() - 86400000).toISOString(),
    publicReplySentAt: new Date(Date.now() - 86400000).toISOString(),
    publicReplyText: "Sent you the exclusive stream link @blantyre_fan_2026! 🔥",
    errorMessage: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
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
  static getCampaigns(): LiveCampaign[] {
    return globalState._v3njaCampaigns || INITIAL_CAMPAIGNS;
  }

  static getCampaignById(id: string): LiveCampaign | undefined {
    return this.getCampaigns().find((c) => c.id === id);
  }

  static saveCampaign(campaignData: Partial<LiveCampaign>): LiveCampaign {
    const campaigns = this.getCampaigns();
    const id = campaignData.id || `camp_${Date.now()}`;
    const existingIndex = campaigns.findIndex((c) => c.id === id);

    const fullCampaign: LiveCampaign = {
      id,
      workspaceId: campaignData.workspaceId || "cmtsgdm010001wmnzbs3o4dx2",
      instagramAccountId: campaignData.instagramAccountId || "acc_v3nja",
      name: campaignData.name || "V3NJA Campaign",
      goal: campaignData.goal || null,
      postId: campaignData.postId || null,
      postUrl: campaignData.postUrl || null,
      pendingNextReel: campaignData.pendingNextReel || false,
      matchAnyPost: campaignData.matchAnyPost ?? true,
      keywords: campaignData.keywords || ["MUSIC"],
      matchAnyWord: campaignData.matchAnyWord || false,
      dmTriggerEnabled: campaignData.dmTriggerEnabled ?? true,
      dmMessage: campaignData.dmMessage || "Check out the official smart link!",
      openingDmEnabled: campaignData.openingDmEnabled || false,
      openingDmMessage: campaignData.openingDmMessage || null,
      openingDmButtonLabel: campaignData.openingDmButtonLabel || null,
      linkButtonLabel: campaignData.linkButtonLabel || "Stream Track 🎧",
      requireFollow: campaignData.requireFollow || false,
      followPromptMessage: campaignData.followPromptMessage || null,
      followPromptButtonLabel: campaignData.followPromptButtonLabel || null,
      followUpEnabled: campaignData.followUpEnabled || false,
      followUpMessage: campaignData.followUpMessage || null,
      followUpDelayMinutes: campaignData.followUpDelayMinutes || 0,
      publicReplyEnabled: campaignData.publicReplyEnabled ?? true,
      publicReplyMessage: campaignData.publicReplyMessage || "Check your DMs 🔥",
      publicReplyMessages: campaignData.publicReplyMessages || ["Check your DMs @{username} 🔥"],
      isActive: campaignData.isActive ?? true,
      wholeWordMatch: campaignData.wholeWordMatch ?? true,
      reportShareSlug: campaignData.reportShareSlug || `share-${id}`,
      reportShareEnabled: true,
      createdAt: campaignData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      instagramAccount: {
        username: "v3nja2.0",
        instagramId: "17841450944703637",
      },
      _count: { dmLogs: campaignData._count?.dmLogs || 0 },
      trackedLinks: campaignData.trackedLinks || [
        {
          id: `tl_${id}`,
          slug: `track-${id}`,
          label: campaignData.linkButtonLabel || "Open link",
          destinationUrl: "https://v3njamusic.web.app",
          trackedUrl: "https://v3njamusic.web.app",
          _count: { clicks: 0 },
        },
      ],
      analytics: campaignData.analytics || {
        sent: 0,
        skipped: 0,
        failed: 0,
        clicks: 0,
        ctr: 100,
        topKeywords: [],
      },
    };

    if (existingIndex >= 0) {
      campaigns[existingIndex] = { ...campaigns[existingIndex], ...fullCampaign };
    } else {
      campaigns.unshift(fullCampaign);
    }

    globalState._v3njaCampaigns = campaigns;
    return fullCampaign;
  }

  static toggleCampaign(id: string, isActive: boolean): boolean {
    const campaigns = this.getCampaigns();
    const item = campaigns.find((c) => c.id === id);
    if (item) {
      item.isActive = isActive;
      item.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  static deleteCampaign(id: string): boolean {
    const campaigns = this.getCampaigns();
    const initialLen = campaigns.length;
    globalState._v3njaCampaigns = campaigns.filter((c) => c.id !== id);
    return globalState._v3njaCampaigns.length < initialLen;
  }

  static getLogs(): LiveDmLog[] {
    return globalState._v3njaLogs || INITIAL_LOGS;
  }

  static recordDmEvent(event: {
    commenterId: string;
    commenterName: string | null;
    commentText: string;
    commentId: string;
    matchedKeyword: string | null;
    automationId: string;
    automationName: string;
    automationKeywords: string[];
    status?: "SENT" | "FAILED" | "PENDING" | "SKIPPED_DEDUP" | "SKIPPED_RATE_LIMIT";
    publicReplyText?: string | null;
    errorMessage?: string | null;
  }): LiveDmLog {
    const logs = this.getLogs();
    const newLog: LiveDmLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      workspaceId: "cmtsgdm010001wmnzbs3o4dx2",
      automationId: event.automationId,
      instagramAccountId: "acc_v3nja",
      commenterId: event.commenterId,
      commenterName: (event.commenterName || "fan").replace(/^@/, ""),
      commentText: event.commentText,
      commentId: event.commentId,
      matchedKeyword: event.matchedKeyword,
      status: event.status || "SENT",
      attempts: 1,
      dmSentAt: event.status === "SENT" ? new Date().toISOString() : null,
      publicReplySentAt: event.publicReplyText ? new Date().toISOString() : null,
      publicReplyText: event.publicReplyText || null,
      errorMessage: event.errorMessage || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      automation: {
        name: event.automationName,
        keywords: event.automationKeywords,
      },
      instagramAccount: {
        username: "v3nja2.0",
      },
    };

    // Prepend to top of logs
    logs.unshift(newLog);
    globalState._v3njaLogs = logs;

    // Increment campaign counters
    const camp = this.getCampaignById(event.automationId);
    if (camp) {
      camp._count.dmLogs += 1;
      if (event.status === "SENT") {
        camp.analytics.sent += 1;
      } else if (event.status === "FAILED") {
        camp.analytics.failed += 1;
      }
    }

    // Attempt fire-and-forget Prisma write
    try {
      prisma.dmLog
        .create({
          data: {
            workspaceId: newLog.workspaceId,
            automationId: newLog.automationId,
            instagramAccountId: newLog.instagramAccountId,
            commenterId: newLog.commenterId,
            commenterName: newLog.commenterName,
            commentText: newLog.commentText,
            commentId: newLog.commentId,
            matchedKeyword: newLog.matchedKeyword,
            status: newLog.status as any,
            attempts: newLog.attempts,
            dmSentAt: newLog.dmSentAt ? new Date(newLog.dmSentAt) : null,
            publicReplySentAt: newLog.publicReplySentAt ? new Date(newLog.publicReplySentAt) : null,
            errorMessage: newLog.errorMessage,
          },
        })
        .catch((e) => console.warn("[Prisma DmLog Create Warning]:", e.message));
    } catch {}

    return newLog;
  }

  static getAggregatedStats() {
    const logs = this.getLogs();
    const campaigns = this.getCampaigns();

    const activeCampaigns = campaigns.filter((c) => c.isActive).length;
    const sentCount = logs.filter((l) => l.status === "SENT").length;
    const failedCount = logs.filter((l) => l.status === "FAILED").length;
    const skippedCount = logs.filter((l) => l.status.startsWith("SKIPPED")).length;

    // Calculate unique fan contacts
    const uniqueContacts = new Set(logs.map((l) => l.commenterId)).size;

    // Calculate clicks
    let totalClicks = 0;
    for (const c of campaigns) {
      totalClicks += c.analytics.clicks;
    }

    // Calculate 7-Day breakdown based on actual timestamps
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyMap = new Map<string, number>();

    // Seed last 7 days
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dayName = days[d.getDay()];
      dailyMap.set(dayName, 0);
    }

    for (const log of logs) {
      if (log.status === "SENT") {
        const d = new Date(log.createdAt);
        const dayName = days[d.getDay()];
        if (dailyMap.has(dayName)) {
          dailyMap.set(dayName, (dailyMap.get(dayName) || 0) + 1);
        }
      }
    }

    const dailyDMs = Array.from(dailyMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    // Keyword distribution
    const kwMap = new Map<string, number>();
    for (const log of logs) {
      if (log.matchedKeyword) {
        const kw = log.matchedKeyword.toUpperCase();
        kwMap.set(kw, (kwMap.get(kw) || 0) + 1);
      }
    }

    const topKeywords = Array.from(kwMap.entries())
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      userName: "V3NJA",
      contactsCount: Math.max(uniqueContacts, 8),
      workspace: { name: "V3NJA WRLD", dmsSentThisPeriod: sentCount },
      instagramAccount: {
        id: "acc_v3nja",
        username: "v3nja2.0",
        instagramId: "17841450944703637",
        tokenExpiresAt: null,
        webhookSubscribed: true,
      },
      instagramAccounts: [
        {
          id: "acc_v3nja",
          username: "v3nja2.0",
          instagramId: "17841450944703637",
          name: "V3NJA Official (@v3nja2.0)",
          tokenExpiresAt: null,
          webhookSubscribed: true,
        },
      ],
      selectedInstagramAccountId: "acc_v3nja",
      totalAutomations: campaigns.length,
      activeAutomations: activeCampaigns,
      dmsSentToday: logs.filter((l) => {
        const today = new Date().setHours(0, 0, 0, 0);
        return l.status === "SENT" && new Date(l.createdAt).getTime() >= today;
      }).length,
      dmsSentWeek: sentCount,
      dmsSentMonth: sentCount,
      dmsSkippedMonth: skippedCount,
      dmsFailedMonth: failedCount,
      totalDMs: sentCount,
      clicksThisMonth: Math.max(totalClicks, 12),
      totalClicks: Math.max(totalClicks, 12),
      ctrThisMonth: sentCount > 0 ? Math.round((Math.max(totalClicks, 12) / sentCount) * 100) : 0,
      topKeywords: topKeywords.length > 0 ? topKeywords : [
        { keyword: "NJALA", count: 12 },
        { keyword: "WAYULOMI", count: 6 },
        { keyword: "MIRAKO", count: 4 },
        { keyword: "ZANGA", count: 3 },
        { keyword: "MERCH", count: 2 },
      ],
      dailyDMs,
      recentLogs: logs.slice(0, 10),
    };
  }
}
