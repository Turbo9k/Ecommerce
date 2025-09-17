"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart, LogOut, Store, Sparkles, Menu } from "lucide-react"
import { DarkModeToggle } from "@/components/dark-mode-toggle"
import { LucideUser } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface User {
  id: string
  email: string
  name: string
  role: string
}

export function Navigation() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { itemCount } = useCart()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)

    // Function to check user from localStorage
    const checkUser = () => {
      try {
        const storedUser = localStorage.getItem("user")
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
      setIsLoading(false)
    }

    // Check immediately
    checkUser()

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        checkUser()
      }
    }

    // Listen for custom events (when user logs in/out in same tab)
    const handleAuthChange = () => {
      checkUser()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("authChange", handleAuthChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("authChange", handleAuthChange)
    }
  }, [])

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("authChange"))
    router.push("/")
  }

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white group"
              >
                <div className="relative">
                  <Store className="h-6 w-6 text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform duration-200" />
                  <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
                  E-Commerce Store
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/products"
                className="hidden sm:inline text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300 font-medium transition-colors duration-200 relative group"
              >
                Products
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <DarkModeToggle />
              <div className="sm:hidden">
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
              <div className="hidden sm:block animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-20 rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white group"
            >
              <div className="relative">
                <Store className="h-6 w-6 text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform duration-200" />
                <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
                E-Commerce Store
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              href="/products"
              className="hidden sm:inline text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300 font-medium transition-colors duration-200 relative group"
            >
              Products
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>

            <DarkModeToggle />

            {isLoading ? (
              <div className="hidden sm:block animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-20 rounded-full"></div>
            ) : (
              <>
                <Link
                  href="/cart"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200 relative group"
                >
                  <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform duration-200 text-gray-700 dark:text-gray-300" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce font-medium">
                      {itemCount}
                    </span>
                  )}
                </Link>

                <div className="hidden sm:flex items-center space-x-3 sm:space-x-4">
                  {user?.role === "admin" && (
                    <Link
                      href="/dashboard"
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
                    >
                      <LucideUser className="h-5 w-5 hover:scale-110 transition-transform duration-200" />
                    </Link>
                  )}
                  {user ? (
                    <>
                      <Link
                        href="/account"
                        className="hidden xs:inline text-lg font-semibold text-gray-800 dark:text-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-200 cursor-pointer"
                      >
                        Hi, {user.name}
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={logout}
                        className="flex items-center space-x-1 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-800 dark:hover:text-red-400 transition-all duration-200"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">Sign Out</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login">
                        <Button
                          size="sm"
                          className="hidden sm:inline bg-white text-gray-900 hover:bg-gray-100 border border-gray-300 shadow-sm dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800 dark:border-gray-600 transition-all duration-200 hover:scale-105"
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/register">
                        <Button
                          size="sm"
                          className="hidden sm:inline bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all duration-200 hover:scale-105 hover:shadow-xl"
                        >
                          Sign Up
                        </Button>
                      </Link>
                    </>
                  )}
                </div>

                {/* Mobile hamburger */}
                <div className="sm:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="p-0">
                      <div className="p-4 space-y-4">
                        <Link href="/products" className="block text-base font-medium text-gray-800 dark:text-gray-200">
                          Products
                        </Link>
                        <Link href="/cart" className="block text-base font-medium text-gray-800 dark:text-gray-200">
                          Cart {itemCount > 0 ? `(${itemCount})` : ""}
                        </Link>
                        {user?.role === "admin" && (
                          <Link href="/dashboard" className="block text-base font-medium text-gray-800 dark:text-gray-200">
                            Dashboard
                          </Link>
                        )}
                        {user ? (
                          <>
                            <Link href="/account" className="block text-base font-medium text-gray-800 dark:text-gray-200">
                              Account
                            </Link>
                            <Button variant="outline" className="w-full justify-start" onClick={logout}>
                              <LogOut className="h-4 w-4 mr-2" /> Sign Out
                            </Button>
                          </>
                        ) : (
                          <>
                            <Link href="/login">
                              <Button variant="outline" className="w-full justify-start">Sign In</Button>
                            </Link>
                            <Link href="/register">
                              <Button className="w-full justify-start">Sign Up</Button>
                            </Link>
                          </>
                        )}
                        <div className="pt-2">
                          <DarkModeToggle />
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
