import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function generateFallbackSvg(text: string = "IG Media"): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4c1d95" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
    <linearGradient id="igRing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f09433" />
      <stop offset="50%" stop-color="#dc2743" />
      <stop offset="100%" stop-color="#bc1888" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#grad)" rx="24" />
  <circle cx="200" cy="180" r="48" fill="none" stroke="url(#igRing)" stroke-width="6" stroke-dasharray="6 4" />
  <rect x="175" y="155" width="50" height="50" rx="12" fill="none" stroke="#ffffff" stroke-width="4" />
  <circle cx="200" cy="180" r="14" fill="none" stroke="#ffffff" stroke-width="4" />
  <circle cx="214" cy="166" r="3" fill="#ffffff" />
  <text x="200" y="270" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#a1a1aa" text-anchor="middle" letter-spacing="1">INSTAGRAM MEDIA</text>
</svg>`;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse(generateFallbackSvg("Missing URL"), {
      status: 200,
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600" },
    });
  }

  // Validate protocol
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return new NextResponse(generateFallbackSvg("Invalid URL"), {
      status: 200,
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600" },
    });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 324.0.0.18.113",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.instagram.com/",
        "Sec-Fetch-Dest": "image",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      console.warn(`[Image Proxy] Upstream returned status ${res.status} for URL: ${url.substring(0, 80)}...`);
      return new NextResponse(generateFallbackSvg("Expired Media"), {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*",
        },
      });
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
    console.error("[Image Proxy Error]", err);
    return new NextResponse(generateFallbackSvg("Error Loading"), {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
