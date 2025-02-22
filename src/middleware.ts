import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, importX509, decodeProtectedHeader } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  const path = request.nextUrl.pathname;
  const NEXT_PUBLIC_FIREBASE_PROJECT_ID =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  // If there is no token and the user is not on /login, redirect to /login
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
      if (!pem) throw new Error("Nema odgovarajućeg javnog ključa");

      // Import the public key in the format 'jose' expects
      const publicKey = await importX509(pem, "RS256");

      // verify the token
      const { payload } = await jwtVerify(token, publicKey, {
        audience: NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        issuer: `https://securetoken.google.com/${NEXT_PUBLIC_FIREBASE_PROJECT_ID}`
      });

      // Provera da li je email verifikovan
      if (!payload.email_verified && path !== "/login" && path !== "/signup") {
        return NextResponse.redirect(new URL("/verify-email", request.url));
      }
    } catch (error) {
      console.error("Verifikacija tokena nije uspela:", error);
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.set("session", "", { maxAge: 0 });
      return response;
    }
  }

  // If the user is logged in and tries to access /login, redirect to /dashboard
  if (token && path === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (token && path === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|assets|favicon.ico).*)"]
};
