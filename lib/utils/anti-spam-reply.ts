/**
 * V3NJA WRLD Anti-Spam Public Comment Auto-Reply Engine
 *
 * Rotates natural, high-converting artist reply variations and personalizes
 * with @{username} to ensure Meta/Instagram never flags comments as repetitive spam.
 */

const DEFAULT_ARTIST_REPLY_POOL = [
  "Yo @{username}! Just sent the VIP link to your DMs 📩🔥",
  "Check your messages @{username}! Dropped the official link in your inbox 🚀🎶",
  "Sent you the exclusive stream link @{username}! Let's gooo 🔥",
  "Slide into your DMs @{username}, the link is waiting for you! 🎧✨",
  "Sent! Appreciate the real support @{username}, check your DM requests 📩",
  "Gotchu @{username}! Check your direct messages right now 🔥",
  "Sent you the link @{username}! Turn the volume all the way up 🎧🔥",
  "Check your DM fam @{username}! V3NJA WRLD vibe is inside 🌍❤️",
  "In your inbox @{username}! Thank you for the love 🙏✨",
  "Just DMed you the official track link @{username}! 🚀🎵",
  "Check DM @{username}! Enjoy the visuals & stream ❤️🔥",
  "Message sent to your inbox @{username}! Run it up 🎶🔥",
  "Link in your DMs @{username}! Blessings fam 👑🔥",
  "Sent @{username}! Add it to your playlist right now 🎧❤️",
];

export function generateAntiSpamPublicReply(
  customVariations?: string[] | null,
  singleCustomReply?: string | null,
  commenterName?: string | null
): string {
  const username = (commenterName || "fam").replace(/^@/, "");

  let pool = DEFAULT_ARTIST_REPLY_POOL;
  if (customVariations && customVariations.length > 0) {
    const valid = customVariations.filter((v) => v && v.trim().length > 0);
    if (valid.length > 0) {
      pool = valid;
    }
  } else if (singleCustomReply && singleCustomReply.trim().length > 0) {
    pool = [singleCustomReply.trim()];
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  const selectedTemplate = pool[randomIndex];

  if (selectedTemplate.includes("{username}")) {
    return selectedTemplate.replace(/\{username\}/gi, username);
  }

  // If the template didn't have {username}, prepend or append naturally
  if (selectedTemplate.toLowerCase().startsWith("yo") || selectedTemplate.toLowerCase().startsWith("check")) {
    return `${selectedTemplate.replace(/!|\./, "")} @${username}! 🔥`;
  }

  return `@${username} ${selectedTemplate}`;
}
