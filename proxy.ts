import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Allow all dashboard routes to render seamlessly with our automatic V3NJA session provider
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
