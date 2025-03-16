import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import { config } from "dotenv"

config()

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/coupon-system"
const MONGODB_DB = process.env.MONGODB_DB || "coupon-system"

const DEFAULT_ADMIN_USERNAME = "admin"
const DEFAULT_ADMIN_PASSWORD = "admin123"

async function seedAdmin() {
  let client

  try {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(MONGODB_DB)

    const existingAdmin = await db.collection("admins").findOne({ username: DEFAULT_ADMIN_USERNAME })

    if (existingAdmin) {
      console.log("Admin user already exists. Skipping creation.")
      return
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10)

    await db.collection("admins").insertOne({
      username: DEFAULT_ADMIN_USERNAME,
      password: hashedPassword,
      createdAt: new Date(),
    })

    console.log("Admin user created successfully.")
    console.log(`Username: ${DEFAULT_ADMIN_USERNAME}`)
    console.log(`Password: ${DEFAULT_ADMIN_PASSWORD}`)
    console.log("Please change these credentials after first login for security reasons.")
  } catch (error) {
    console.error("Error seeding admin user:", error)
  } finally {
    if (client) {
      await client.close()
      console.log("MongoDB connection closed")
    }
  }
}


seedAdmin()

