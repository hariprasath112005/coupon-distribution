import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check admin authentication
    const isAuthenticated = await checkAdminAuth()

    if (!isAuthenticated) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const couponId = params.id

    if (!couponId || !ObjectId.isValid(couponId)) {
      return NextResponse.json({ message: "Invalid coupon ID" }, { status: 400 })
    }

    const { isActive } = await request.json()

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ message: "isActive must be a boolean value" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Update coupon
    const result = await db.collection("coupons").updateOne({ _id: new ObjectId(couponId) }, { $set: { isActive } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Coupon not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Coupon updated successfully",
    })
  } catch (error) {
    console.error("Error updating coupon:", error)
    return NextResponse.json({ message: "An error occurred while updating the coupon" }, { status: 500 })
  }
}

