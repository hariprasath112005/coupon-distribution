"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Home() {
  const [coupon, setCoupon] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const claimCoupon = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/coupons/claim", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to claim coupon")
      }

      setCoupon(data.coupon.code)
      setSuccess("Coupon claimed successfully!")
    } catch (err: any) {
      setError(err.message || "An error occurred while claiming the coupon")
      setCoupon(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Coupon Distribution</CardTitle>
          <CardDescription className="text-center">Claim your exclusive coupon code</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">Success</AlertTitle>
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}

          {coupon && (
            <div className="p-4 bg-gray-100 rounded-md text-center">
              <p className="text-sm text-gray-500 mb-1">Your coupon code:</p>
              <p className="text-xl font-bold tracking-wider">{coupon}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={claimCoupon} disabled={loading}>
            {loading ? "Processing..." : "Claim Coupon"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}

