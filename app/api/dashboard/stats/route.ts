import { NextResponse } from "next/server";
import { LiveDataStore } from "@/lib/db/live-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = LiveDataStore.getAggregatedStats();
    return NextResponse.json(
      { success: true, data: stats },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    console.error("[Dashboard Stats Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
