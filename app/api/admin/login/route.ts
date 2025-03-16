import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ message: "Username and password are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Find admin user
    const admin = await db.collection("admins").findOne({ username })

    if (!admin) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Set admin session cookie
    const sessionId = crypto.randomUUID()
    const cookieStore = cookies()

    cookieStore.set("admin_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    })

    // Store session in database
    await db.collection("admin_sessions").insertOne({
      sessionId,
      adminId: admin._id,
      createdAt: new Date(),
    })

    return NextResponse.json({ message: "Login successful" })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "An error occurred during login" }, { status: 500 })
  }
}

