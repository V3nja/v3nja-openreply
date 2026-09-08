/**
 * V3NJA WRLD Artist-Branded DM Formatter
 *
 * Formats direct messages with clean typography, emoji hierarchy,
 * personalized username greetings, smart link embeds, and official artist outro.
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
    return `👑 V3NJA WRLD · FAN EXCLUSIVE 🌍

Yo @${username}! Bless up for showing love on the track ❤️

🔒 FOLLOW REQUIREMENT:
${followPrompt.replace(/\{username\}/gi, username)}

👉 Make sure you follow @v3nja2.0 on Instagram, then tap the link to unlock full audio & visuals!`;
  }

  let body = rawMessage?.trim() || "";

  if (body) {
    body = body.replace(/\{username\}/gi, username);
  } else {
    body = `Yo @${username}! 🔥 Here is the exclusive official smart link you requested.`;
  }

  // Ensure smart link is cleanly embedded if provided and not already inside message
  if (smartLinkUrl && !body.includes(smartLinkUrl)) {
    body = `${body}\n\n🔗 Stream / Watch: ${smartLinkUrl}`;
  }

  return `🔥 V3NJA WRLD · OFFICIAL DROP 🌍

${body}

🎧 Available on Apple Music, Spotify, Audiomack & YouTube.
Tag @v3nja2.0 in your IG story with the vibe! 🚀❤️`;
}
