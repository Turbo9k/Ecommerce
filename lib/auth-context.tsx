"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { userStorage } from "./user-storage"

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check for stored user session
    try {
      let storedUser = localStorage.getItem("user")
      // Fallback to cookie if localStorage missing
      if (!storedUser && typeof document !== "undefined") {
        const cookiePair = document.cookie.split("; ").find((row) => row.startsWith("user="))
        if (cookiePair) {
          storedUser = decodeURIComponent(cookiePair.split("=")[1])
          // Mirror into localStorage for consistency
          localStorage.setItem("user", storedUser)
        }
      }
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      }
    } catch (error) {
      console.error("Error parsing stored user:", error)
      localStorage.removeItem("user")
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = userStorage.validateCredentials(email, password)

    if (foundUser) {
      const userSession = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
      }

      setUser(userSession)

      if (mounted) {
        localStorage.setItem("user", JSON.stringify(userSession))
        window.dispatchEvent(new Event("authChange"))
      }

      return true
    }
    return false
  }

  const register = async (
    email: string,
    password: string,
    name: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if user already exists
      const existingUser = userStorage.getUserByEmail(email)
      if (existingUser) {
        return { success: false, error: "User with this email already exists" }
      }

      // Create new user
      const newUser = userStorage.createUser({
        email,
        password,
        name,
        role: "customer", // Default role for new registrations
      })

      return { success: true }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: "An error occurred during registration" }
    }
  }

  const logout = () => {
    setUser(null)
    if (mounted) {
      localStorage.removeItem("user")
      window.dispatchEvent(new Event("authChange"))
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading, register }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
