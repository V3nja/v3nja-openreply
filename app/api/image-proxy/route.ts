import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const HIGH_RES_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
];

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) {
    return NextResponse.redirect(HIGH_RES_FALLBACK_IMAGES[0], 307);
  }

  // If already a clean external URL, redirect directly
  if (url.includes("unsplash.com") || url.includes("images.unsplash.com")) {
    return NextResponse.redirect(url, 307);
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 324.0.0.18.113",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        Referer: "https://www.instagram.com/",
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      // Deterministically pick fallback based on URL length/hash
      const idx = Math.abs(url.length) % HIGH_RES_FALLBACK_IMAGES.length;
      return NextResponse.redirect(HIGH_RES_FALLBACK_IMAGES[idx], 307);
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await res.arrayBuffer();

    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    const idx = Math.abs(url.length) % HIGH_RES_FALLBACK_IMAGES.length;
    return NextResponse.redirect(HIGH_RES_FALLBACK_IMAGES[idx], 307);
  }
}
