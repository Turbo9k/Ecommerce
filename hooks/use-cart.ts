"use client"

import { useState, useEffect } from "react"
import { cartStore } from "@/lib/cart-store"

export function useCart() {
  const [items, setItems] = useState(cartStore.items)
  const [itemCount, setItemCount] = useState(cartStore.getItemCount())

  useEffect(() => {
    const unsubscribe = cartStore.subscribe(() => {
      setItems([...cartStore.items])
      setItemCount(cartStore.getItemCount())
    })

    return unsubscribe
  }, [])

  return {
    items,
    itemCount,
    addItem: cartStore.addItem.bind(cartStore),
    removeItem: cartStore.removeItem.bind(cartStore),
    updateQuantity: cartStore.updateQuantity.bind(cartStore),
    clearCart: cartStore.clearCart.bind(cartStore),
    total: cartStore.getTotal(),
  }
}
