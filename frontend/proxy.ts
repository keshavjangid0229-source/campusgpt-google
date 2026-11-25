import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = process.env.CAMPUSGPT_PROXY_TOKEN;
  const username = process.env.CAMPUSGPT_PREVIEW_USER || "campus";
  const password = process.env.CAMPUSGPT_PREVIEW_PASSWORD;
  const isVercel = process.env.VERCEL === "1";

  if (isVercel && (!password || !token || !process.env.CAMPUSGPT_BACKEND_URL)) {
    return new NextResponse("CampusGPT deployment settings are incomplete.", { status: 503 });
  }

  if (password) {
    const expected = Buffer.from("Basic " + Buffer.from(`${username}:${password}`).toString("base64"));
    const supplied = Buffer.from(request.headers.get("authorization") ?? "");
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
      return new NextResponse("Sign in to CampusGPT.", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="CampusGPT"', "Cache-Control": "no-store" },
      });
    }
  }

  if (token && request.nextUrl.pathname.startsWith("/api/campus/")) {
    const headers = new Headers(request.headers);
    headers.delete("authorization");
    headers.set("x-campusgpt-proxy-token", token);
    return NextResponse.next({ request: { headers } });
  }
  return NextResponse.next();
}

export const config = { matcher: ["/chat/:path*", "/api/campus/:path*"] };
