import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, importX509, decodeProtectedHeader } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  const path = request.nextUrl.pathname;
  const NEXT_PUBLIC_FIREBASE_PROJECT_ID =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  // Allow API routes
  if (path.startsWith("/api")) {
    if (request.method !== "POST") {
      return new NextResponse("Method Not Allowed", { status: 405 });
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users to /login
  if (!token && path !== "/login" && path !== "/signup") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token) {
    try {
      const header = decodeProtectedHeader(token);
      if (!header.kid) {
        throw new Error("Missing 'kid' in token header");
      }
      const kid = header.kid;

      const res = await fetch(
        "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
      );
      const keyMap = await res.json();

      const pem = keyMap[kid];
      if (!pem) throw new Error("No matching public key found");

      const publicKey = await importX509(pem, "RS256");

      const { payload } = await jwtVerify(token, publicKey, {
        audience: NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        issuer: `https://securetoken.google.com/${NEXT_PUBLIC_FIREBASE_PROJECT_ID}`
      });

      const emailVerified = payload.email_verified === true;

      // Handle unverified email
      if (!emailVerified) {
        if (path !== "/login" && path !== "/signup") {
          return NextResponse.redirect(new URL("/login", request.url));
        }
      } else {
        // Redirect verified users from /login or / to /dashboard
        if (path === "/login" || path === "/") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.set("session", "", { maxAge: 0 });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|assets|favicon.ico).*)"]
};
