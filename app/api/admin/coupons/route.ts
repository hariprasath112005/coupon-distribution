import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectToDatabase } from "@/lib/mongodb"

// Middleware to check admin authentication
async function checkAdminAuth() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("admin_session")?.value

  if (!sessionId) {
    return false
  }

  const { db } = await connectToDatabase()
  const session = await db.collection("admin_sessions").findOne({ sessionId })

  return !!session
}

export async function GET() {
  try {
    // Check admin authentication
    const isAuthenticated = await checkAdminAuth()

    if (!isAuthenticated) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Get all coupons
    const coupons = await db.collection("coupons").find({}).toArray()

    return NextResponse.json({ coupons })
  } catch (error) {
    console.error("Error fetching coupons:", error)
    return NextResponse.json({ message: "An error occurred while fetching coupons" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check admin authentication
    const isAuthenticated = await checkAdminAuth()

    if (!isAuthenticated) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code || typeof code !== "string" || code.trim() === "") {
      return NextResponse.json({ message: "Valid coupon code is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if coupon already exists
    const existingCoupon = await db.collection("coupons").findOne({ code })

    if (existingCoupon) {
      return NextResponse.json({ message: "Coupon code already exists" }, { status: 409 })
    }

    // Create new coupon
    const result = await db.collection("coupons").insertOne({
      code,
      isActive: true,
      isClaimed: false,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      message: "Coupon created successfully",
      couponId: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating coupon:", error)
    return NextResponse.json({ message: "An error occurred while creating the coupon" }, { status: 500 })
  }
}

