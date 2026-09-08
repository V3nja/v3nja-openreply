/**
 * V3NJA WRLD Luxury Artist DM Formatter
 */

export function formatBrandedArtistDM({
  rawMessage,
  commenterName,
  campaignTitle,
  smartLinkUrl,
  followGated = false,
  followPrompt = "",
}: {
  rawMessage?: string | null;
  commenterName?: string | null;
  campaignTitle?: string | null;
  smartLinkUrl?: string | null;
  followGated?: boolean;
  followPrompt?: string | null;
}): string {
  const username = (commenterName || "fam").replace(/^@/, "");

  if (followGated && followPrompt) {
    return `👑 V3NJA WRLD · VIP ACCESS 🌍

Yo @${username}! Bless up for showing love ❤️

🔒 Follow Gate Active:
${followPrompt.replace(/\{username\}/gi, username)}

👉 Tap follow on @v3nja2.0, then enjoy the official music drop!`;
  }

  let body = rawMessage?.trim() || "";

  if (body) {
    body = body.replace(/\{username\}/gi, username);
  } else {
    body = `Yo @${username}! 🔥 Here is the official VIP smart link you requested.`;
  }

  if (smartLinkUrl && !body.includes(smartLinkUrl)) {
    body = `${body}\n\n🎧 Stream & Watch:\n${smartLinkUrl}`;
  }

  return `🔥 V3NJA WRLD · OFFICIAL DROP 🌍

${body}

Available on Spotify, Apple Music, Audiomack & YouTube.
Tag @v3nja2.0 in your IG story with the vibe! 🚀❤️`;
}
