import { NextRequest, NextResponse } from "next/server";

const LIVE_TOKEN =
  process.env.PAGE_ACCESS_TOKEN ||
  process.env.INSTAGRAM_ACCESS_TOKEN ||
  "EAASO6H4IszIBSctXA6UtP2RRagFz8VcyDruAZBuKVvlvDbhftvRA5z2MXB9A377v4WHSE1UvKXfHWU2dxpZAyz3RuIV7gcyg16HzHyDZBXVSQFIlbWa5fb5kW52JLwWFnkoHFj1INsR07RDLoj39rg5x8ZB1duIRcBraj672XUWJaXqxCIAEZAzqja5Wk5CZADkOQfGU6T8ybtNlJgNaK59LBaa7D9C9YS7hnEPAZDZD";

const INSTAGRAM_ACCOUNT_ID = "17841450944703637";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(`https://graph.facebook.com/v22.0/${INSTAGRAM_ACCOUNT_ID}/media`);
    url.searchParams.set(
      "fields",
      "id,caption,media_type,media_product_type,media_url,thumbnail_url,timestamp,permalink,like_count,comments_count"
    );
    url.searchParams.set("limit", "50");
    url.searchParams.set("access_token", LIVE_TOKEN);

    const res = await fetch(url.toString(), { cache: "no-store" });
    const data = await res.json();

    if (data.data && Array.isArray(data.data)) {
      return NextResponse.json({ success: true, data: data.data });
    }

    if (data.error) {
      console.warn("[Instagram Posts] Meta API returned error:", data.error);
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (err: any) {
    console.error("[Instagram Posts] Fetch error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
