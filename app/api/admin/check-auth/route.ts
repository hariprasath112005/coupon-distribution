import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("admin_session")?.value

    if (!sessionId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Check if session exists
    const session = await db.collection("admin_sessions").findOne({ sessionId })

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ message: "Authenticated" })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ message: "An error occurred during authentication check" }, { status: 500 })
  }
}

