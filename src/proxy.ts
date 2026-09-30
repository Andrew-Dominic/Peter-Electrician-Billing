import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET || "peter-electricians-super-secret-key-for-local-mvp-only";
const encodedKey = new TextEncoder().encode(secretKey);

export async function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isPublicPath = isLoginPage || request.nextUrl.pathname.startsWith("/api/auth");

  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session) {
    try {
      await jwtVerify(session, encodedKey, {
        algorithms: ["HS256"],
      });
      if (isLoginPage) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      if (!isPublicPath) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
