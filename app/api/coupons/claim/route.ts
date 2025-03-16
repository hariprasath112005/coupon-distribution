import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectToDatabase } from "@/lib/mongodb"

// Cooldown period in milliseconds (e.g., 24 hours)
const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000

export async function POST(request: Request) {
  try {
    // Get client IP address
    const ip = request.headers.get("x-forwarded-for") || "unknown"

    // Get or set session ID from cookies
    const cookieStore = cookies()
    let sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      sessionId = crypto.randomUUID()
      cookieStore.set("session_id", sessionId, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      })
    }

    const { db } = await connectToDatabase()

    // Check if user has claimed a coupon recently
    const recentClaim = await db.collection("coupons").findOne({
      "claimedBy.ip": ip,
      "claimedBy.claimedAt": { $gt: new Date(Date.now() - COOLDOWN_PERIOD).toISOString() },
    })

    if (recentClaim) {
      return NextResponse.json(
        { message: "You have already claimed a coupon recently. Please try again later." },
        { status: 429 },
      )
    }

    // Check if this session has claimed a coupon
    const sessionClaim = await db.collection("coupons").findOne({
      "claimedBy.sessionId": sessionId,
    })

    if (sessionClaim) {
      return NextResponse.json({ message: "You have already claimed a coupon from this browser." }, { status: 429 })
    }

    // Find the next available coupon using round-robin approach
    const availableCoupon = await db.collection("coupons").findOne({
      isActive: true,
      isClaimed: false,
    })

    if (!availableCoupon) {
      return NextResponse.json(
        { message: "No coupons available at the moment. Please try again later." },
        { status: 404 },
      )
    }

    // Update the coupon as claimed
    await db.collection("coupons").updateOne(
      { _id: availableCoupon._id },
      {
        $set: {
          isClaimed: true,
          claimedBy: {
            ip,
            sessionId,
            claimedAt: new Date().toISOString(),
          },
        },
      },
    )

    return NextResponse.json({
      message: "Coupon claimed successfully",
      coupon: {
        code: availableCoupon.code,
      },
    })
  } catch (error) {
    console.error("Error claiming coupon:", error)
    return NextResponse.json({ message: "An error occurred while processing your request" }, { status: 500 })
  }
}

