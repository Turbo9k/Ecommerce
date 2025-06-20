"use client"

import { useState, useEffect } from "react"
import { orderStore } from "@/lib/order-store"

export function useOrders() {
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    // Initial load
    setOrders(orderStore.getAllOrders())

    // Subscribe to changes
    const unsubscribe = orderStore.subscribe(() => {
      setOrders(orderStore.getAllOrders())
    })

    return unsubscribe
  }, [])

  return {
    orders,
    createOrder: (orderData: any) => orderStore.createOrder(orderData),
    updateOrderStatus: (orderId: string, status: any, trackingNumber?: string) =>
      orderStore.updateOrderStatus(orderId, status, trackingNumber),
    getOrdersByUserId: (userId: string) => orderStore.getOrdersByUserId(userId),
    getRecentOrders: (limit?: number) => orderStore.getRecentOrders(limit),
    getOrderStats: () => orderStore.getOrderStats(),
    getOrderById: (orderId: string) => orderStore.getOrderById(orderId),
  }
}
