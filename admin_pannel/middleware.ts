import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname;

  // Get the token from the cookies
  const isAuthenticated = request.cookies.has("adminAuthToken");

  // Allow access to login page and static files
  if (
    path === "/login" ||
    path.startsWith("/static/") ||
    path.startsWith("/_next/")
  ) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login page if trying to access protected routes
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next/static (static files)
     * 3. /_next/image (image optimization files)
     * 4. /favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
