import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = process.env.CAMPUSGPT_PROXY_TOKEN;
  const isVercel = process.env.VERCEL === "1";

  if (isVercel && (!token || !process.env.CAMPUSGPT_BACKEND_URL)) {
    return new NextResponse("CampusGPT deployment settings are incomplete.", { status: 503 });
  }

  if (token) {
    const headers = new Headers(request.headers);
    headers.delete("authorization");
    headers.set("x-campusgpt-proxy-token", token);
    return NextResponse.next({ request: { headers } });
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/campus/:path*" };
