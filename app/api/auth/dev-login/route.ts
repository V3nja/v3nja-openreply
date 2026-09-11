export const dynamic = "force-dynamic";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { ensureWorkspaceForUser } from "@/lib/workspace";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get("email") || "v3nja@wrld.music";
  const name = searchParams.get("name") || "V3NJA Official";
  const target = searchParams.get("target") || "/dashboard";

  // 1. Find or create user
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        emailVerified: new Date(),
      },
    });
  }

  // Ensure workspace exists
  await ensureWorkspaceForUser(user.id, user.email);

  // 2. Create session token in database
  const sessionToken = crypto.randomUUID();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires,
    },
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Entering V3NJA WRLD...</title>
  <meta http-equiv="refresh" content="0;url=${target}">
  <style>
    body {
      background: #09090b;
      color: #f4f4f5;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      text-align: center;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(249, 115, 22, 0.2);
      border-top-color: #f97316;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    a {
      color: #f97316;
      text-decoration: none;
      font-weight: 600;
      margin-top: 12px;
      display: inline-block;
    }
  </style>
  <script>
    window.location.replace("${target}");
  </script>
</head>
<body>
  <div class="spinner"></div>
  <p style="font-size: 16px; font-weight: 600;">Loading V3NJA WRLD Dashboard...</p>
  <p style="font-size: 13px; color: #a1a1aa;">If you are not redirected automatically, <a href="${target}">click here</a>.</p>
</body>
</html>`;

  const response = new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });

  // Set session cookies
  const cookieOptions = {
    expires,
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
  };

  response.cookies.set("authjs.session-token", sessionToken, cookieOptions);
  response.cookies.set("__Secure-authjs.session-token", sessionToken, {
    ...cookieOptions,
    secure: true,
  });
  response.cookies.set("next-auth.session-token", sessionToken, cookieOptions);

  return response;
}

export async function POST(request: NextRequest) {
  return GET(request);
}
