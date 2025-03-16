import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/coupon-system"
const MONGODB_DB = process.env.MONGODB_DB || "coupon-system"

// Cache the MongoDB connection to reuse it across requests
let cachedClient: MongoClient | null = null
let cachedDb: any = null

export async function connectToDatabase() {
  // If we have the cached connection, return it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  // If no cached connection, create a new one
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI)
    await cachedClient.connect()
  }

  // Get the database
  cachedDb = cachedClient.db(MONGODB_DB)

  return { client: cachedClient, db: cachedDb }
}

