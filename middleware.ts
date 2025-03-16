import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Check if the path is for admin API routes
  if (path.startsWith("/api/admin") && !path.includes("/login")) {
    // Get the admin session cookie
    const adminSession = request.cookies.get("admin_session")?.value

    // If no admin session, redirect to login
    if (!adminSession) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
  }

  return NextResponse.next()
}

// Configure the middleware to run only for specific paths
export const config = {
  matcher: ["/api/admin/:path*"],
}

