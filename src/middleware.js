import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin/session";

export async function middleware(request) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isValid = await verifySessionToken(token);

  if (!isValid) {
    const loginUrl = new URL("/admin", request.url);
    // So the login page can send the person back to where they were
    // headed (e.g. /admin/add-blog) once they successfully log in.
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Only the protected add-blog area requires a session. /admin itself is
  // the login page and must stay reachable by anyone who isn't logged in
  // yet, or logging in would be impossible.
  matcher: ["/admin/add-blog/:path*"],
};
