"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Package, ArrowRight, Download, CreditCard } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/lib/auth-context"
import { orderStore } from "@/lib/order-store"
import { ProductStore } from "@/lib/product-store"

export default function CheckoutSuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [orderCreated, setOrderCreated] = useState(false)
  const { clearCart } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    // Get session ID from URL
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get("session_id")
    setSessionId(id)

    // Get checkout items from localStorage
    const storedItems = localStorage.getItem("checkout_items")
    if (storedItems && !orderCreated && user && id) {
      const items = JSON.parse(storedItems)
      setOrderItems(items)

      // Create the order
      const orderTotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
      const tax = orderTotal * 0.08
      const finalTotal = orderTotal + tax

      const newOrder = {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        items: items,
        total: finalTotal,
        status: "pending" as const,
        stripeSessionId: id,
      }

      // Create order and reduce inventory
      orderStore.createOrder(newOrder)

      // Reduce inventory for each purchased item
      const productStore = ProductStore.getInstance()
      items.forEach((item: any) => {
        const product = productStore.getProduct(item.id)
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity)
          productStore.updateStock(item.id, newStock)
        }
      })

      setOrderCreated(true)

      // Clean up
      localStorage.removeItem("checkout_items")

      // Clear cart
      clearCart()
    }
  }, [clearCart, user, orderCreated])

  const orderTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = orderTotal * 0.08
  const finalTotal = orderTotal + tax

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Thank you for your purchase!</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your payment has been processed successfully through Stripe. You will receive an email confirmation
                shortly.
              </p>
            </div>

            {sessionId && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Stripe Session ID:</span>
                  <span className="font-mono text-sm">{sessionId.slice(0, 20)}...</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Order Reference:</span>
                  <span className="font-mono font-medium">{sessionId.slice(-8).toUpperCase()}</span>
                </div>
                {orderItems.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount:</span>
                    <span className="font-bold text-lg">${finalTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Payment Status:</span>
                  <span className="text-green-600 font-medium flex items-center">
                    <CreditCard className="h-4 w-4 mr-1" />
                    Paid via Stripe
                  </span>
                </div>
              </div>
            )}

            {/* Order Items Summary */}
            {orderItems.length > 0 && (
              <div className="text-left">
                <h3 className="font-medium mb-3 text-center">Order Summary</h3>
                <div className="space-y-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <hr className="my-2" />
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${orderTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Package className="h-4 w-4" />
                <span>Your order will be processed and shipped within 1-2 business days</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Download className="h-4 w-4" />
                <span>You will receive tracking information via email</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/account">
                <Button className="flex items-center space-x-2">
                  <span>View Order History</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </div>

            {/* Success Notice */}
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                ✅ <strong>Order Created & Inventory Updated!</strong> Your order has been added to your account and
                inventory has been automatically reduced. You can track the order progress from your account page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
