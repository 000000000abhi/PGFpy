"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function AuthGuard({ children, requireAuth = true, redirectTo = "/auth/signin" }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (!loading) {
      console.log("AuthGuard check - requireAuth:", requireAuth, "user:", user?.email || "none")

      if (requireAuth && !user) {
        console.log("Redirecting to sign in - no user found")
        router.push(redirectTo)
        setShouldRender(false)
      } else if (!requireAuth && user) {
        console.log("Redirecting to dashboard - user already signed in")
        router.push("/dashboard")
        setShouldRender(false)
      } else {
        console.log("Auth requirements met, rendering children")
        setShouldRender(true)
      }
    }
  }, [user, loading, requireAuth, redirectTo, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-navy-950 flex items-center justify-center">
        <Card className="border-0 shadow-lg bg-white dark:bg-navy-900">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-brand-600" />
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Don't render if auth requirements aren't met
  if (!shouldRender) {
    return (
      <div className="min-h-screen bg-white dark:bg-navy-950 flex items-center justify-center">
        <Card className="border-0 shadow-lg bg-white dark:bg-navy-900">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-4 h-4 mx-auto mb-4 animate-spin text-brand-600" />
            <p className="text-gray-600 dark:text-gray-300">
              {requireAuth && !user ? "Redirecting to sign in..." : "Redirecting..."}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
