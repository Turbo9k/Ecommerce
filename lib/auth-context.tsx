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

  const loadUser = () => {
    try {
      let storedUser = localStorage.getItem("user")
      // Fallback to cookie if localStorage missing
      if (!storedUser && typeof document !== "undefined") {
        const cookieUser = document.cookie.split("; ").find((row) => row.startsWith("user="))
        if (cookieUser) {
          try {
            storedUser = decodeURIComponent(cookieUser.split("=")[1])
            localStorage.setItem("user", storedUser)
          } catch (e) {
            console.error("Error decoding user cookie:", e)
          }
        } else {
          // Fallback to decode JWT payload from auth cookie
          const cookieAuth = document.cookie.split("; ").find((row) => row.startsWith("auth="))
          if (cookieAuth) {
            const raw = cookieAuth.split("=")[1]
            const parts = raw.split(".")
            if (parts.length === 3) {
              try {
                const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")))
                const jwtUser = {
                  id: payload.sub as string,
                  email: payload.email as string,
                  name: (payload.name as string) || "",
                  role: (payload.role as string) || "customer",
                }
                storedUser = JSON.stringify(jwtUser)
                localStorage.setItem("user", storedUser)
              } catch (e) {
                console.error("Error decoding JWT:", e)
              }
            }
          }
        }
      }
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Error parsing stored user:", error)
      localStorage.removeItem("user")
      setUser(null)
    }
  }

  useEffect(() => {
    setMounted(true)
    loadUser()
    setIsLoading(false)

    // Listen for auth changes (e.g., after login)
    const handleAuthChange = () => {
      loadUser()
    }
    window.addEventListener("authChange", handleAuthChange)
    
    // Also check periodically for cookie changes (in case cookies are set by server)
    // Check less frequently to avoid performance issues
    const interval = setInterval(() => {
      const cookieUser = document.cookie.split("; ").find((row) => row.startsWith("user="))
      if (cookieUser) {
        try {
          const cookieValue = decodeURIComponent(cookieUser.split("=")[1])
          const currentUser = localStorage.getItem("user")
          if (!currentUser || currentUser !== cookieValue) {
            loadUser()
          }
        } catch (e) {
          // Cookie might be malformed, ignore
        }
      } else if (localStorage.getItem("user")) {
        // Cookie was removed but localStorage still has user - clear it
        localStorage.removeItem("user")
        setUser(null)
      }
    }, 2000)

    return () => {
      window.removeEventListener("authChange", handleAuthChange)
      clearInterval(interval)
    }
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
      const existingUser = userStorage.getUserByEmail(email)
      if (existingUser) {
        return { success: false, error: "User with this email already exists" }
      }

      userStorage.createUser({
        email,
        password,
        name,
        role: "customer",
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
