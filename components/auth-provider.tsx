"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { authService, type AuthUser } from "@/lib/auth"

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Get initial user with better error handling
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...")
        const currentUser = await authService.getCurrentUser()

        if (mounted) {
          console.log("Initial user:", currentUser?.email || "No user")
          setUser(currentUser)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes with better error handling
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (user) => {
      if (mounted) {
        console.log("Auth state updated:", user?.email || "No user")
        setUser(user)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      console.log("Signing in user:", email)
      await authService.signIn(email, password)
      // User will be set via onAuthStateChange
    } catch (error) {
      console.error("SignIn error in provider:", error)
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true)
    try {
      console.log("Signing up user:", email)
      await authService.signUp(email, password, fullName)
      // User will be set via onAuthStateChange
    } catch (error) {
      console.error("SignUp error in provider:", error)
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      console.log("Signing out user")
      await authService.signOut()
      setUser(null)
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
    try {
      await authService.updateProfile(updates)
      const user = await authService.getCurrentUser()
      setUser(user)
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
