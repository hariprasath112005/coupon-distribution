"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, CheckCircle, Plus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Coupon {
  _id: string
  code: string
  isActive: boolean
  isClaimed: boolean
  claimedBy?: {
    ip: string
    sessionId: string
    claimedAt: string
  }
}

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [newCoupon, setNewCoupon] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/check-auth")
      if (response.ok) {
        setIsAuthenticated(true)
        fetchCoupons()
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      setIsAuthenticated(true)
      fetchCoupons()
    } catch (err: any) {
      setError(err.message || "An error occurred during login")
    }
  }

  const fetchCoupons = async () => {
    try {
      const response = await fetch("/api/admin/coupons")
      if (!response.ok) {
        throw new Error("Failed to fetch coupons")
      }
      const data = await response.json()
      setCoupons(data.coupons)
    } catch (error) {
      console.error("Failed to fetch coupons:", error)
    }
  }

  const addCoupon = async () => {
    if (!newCoupon.trim()) return

    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: newCoupon }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to add coupon")
      }

      setNewCoupon("")
      setSuccess("Coupon added successfully!")
      fetchCoupons()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || "An error occurred while adding the coupon")

      // Clear error message after 3 seconds
      setTimeout(() => setError(null), 3000)
    }
  }

  const toggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update coupon status")
      }

      fetchCoupons()
    } catch (error) {
      console.error("Failed to toggle coupon status:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <Tabs defaultValue="coupons">
        <TabsList className="mb-4">
          <TabsTrigger value="coupons">Manage Coupons</TabsTrigger>
          <TabsTrigger value="claims">Claim History</TabsTrigger>
        </TabsList>

        <TabsContent value="coupons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Coupon</CardTitle>
              <CardDescription>Create a new coupon code for distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-700">Success</AlertTitle>
                  <AlertDescription className="text-green-600">{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={newCoupon}
                  onChange={(e) => setNewCoupon(e.target.value)}
                />
                <Button onClick={addCoupon}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Coupons</CardTitle>
              <CardDescription>Manage existing coupon codes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Claimed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No coupons found. Add some coupons to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    coupons.map((coupon) => (
                      <TableRow key={coupon._id}>
                        <TableCell className="font-medium">{coupon.code}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${coupon.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                          >
                            {coupon.isActive ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${coupon.isClaimed ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
                          >
                            {coupon.isClaimed ? "Claimed" : "Available"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <Switch
                              checked={coupon.isActive}
                              onCheckedChange={() => toggleCouponStatus(coupon._id, coupon.isActive)}
                              disabled={coupon.isClaimed}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims">
          <Card>
            <CardHeader>
              <CardTitle>Claim History</CardTitle>
              <CardDescription>View all claimed coupons and user information</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coupon Code</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Session ID</TableHead>
                    <TableHead>Claimed At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.filter((c) => c.isClaimed).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No claimed coupons found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    coupons
                      .filter((coupon) => coupon.isClaimed && coupon.claimedBy)
                      .map((coupon) => (
                        <TableRow key={coupon._id}>
                          <TableCell className="font-medium">{coupon.code}</TableCell>
                          <TableCell>{coupon.claimedBy?.ip}</TableCell>
                          <TableCell>{coupon.claimedBy?.sessionId.substring(0, 8)}...</TableCell>
                          <TableCell>{new Date(coupon.claimedBy?.claimedAt || "").toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

