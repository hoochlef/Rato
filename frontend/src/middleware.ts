import { NextResponse, type NextRequest } from "next/server";
import { getUserFromCookie } from "@/lib/auth-server";

interface UserPayload {
  role?: string;
  [key: string]: any; // Allow other properties
}

export async function middleware(req: NextRequest) {
  const payload = await getUserFromCookie() as UserPayload;
  const { pathname } = req.nextUrl;

  // --- START: Skip middleware for static assets, API routes, etc. ---
  // This regex matches paths starting with /api/, /_next/static/, /_next/image/,
  // or ending with common static file extensions served from /public
  if (
    /^\/(api|_next\/static|_next\/image|favicon\.ico|.*\.png$|.*\.jpg$|.*\.jpeg$|.*\.gif$|.*\.svg$)/.test(pathname)
  ) {
    return NextResponse.next(); // Allow these requests to pass through directly
  }
  // --- END: Skip middleware ---

  const homeUrl = new URL("/", req.url);
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // 1. Unauthenticated user trying to access dashboard -> redirect to home
  if (!payload && isDashboardRoute) {
    return NextResponse.redirect(homeUrl);
  }

  // 2. Authenticated user logic
    if (payload) {
    // Admin redirection
    const userRole = payload.role;

    if (userRole === "admin") {
      if (!pathname.startsWith("/dashboard/admin")) {
        return NextResponse.redirect(new URL("/dashboard/admin", req.url));
      }
      return NextResponse.next();
    }
    else if (userRole === "supervisor") {
      if (!pathname.startsWith("/dashboard/supervisor")) {
        return NextResponse.redirect(new URL("/dashboard/supervisor", req.url));
      }
      return NextResponse.next();
    }
    else {
      if (isDashboardRoute) {
        return NextResponse.redirect(homeUrl);
      }
      return NextResponse.next();
    }
  }

  // 3. Unauthenticated user on a non-dashboard page -> allow access
  return NextResponse.next();
}

// Optional: Keep matcher commented out to run on all routes, or refine later
// export const config = {
//   matcher: "/dashboard/:path*", // Example: Match all dashboard paths
// };
