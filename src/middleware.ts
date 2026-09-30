import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";

  // Public paths that don't require authentication
  const isPublicPath = isLoginPage || request.nextUrl.pathname.startsWith("/api/auth");

  if (!session && !isPublicPath) {
    // Redirect unauthenticated users to login page
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isLoginPage) {
    // Redirect authenticated users away from login page
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except api, _next/static, _next/image, and favicon.ico
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
