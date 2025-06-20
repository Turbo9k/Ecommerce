interface CartItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  quantity: number
  image: string
  category: string
  stock: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: any) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

class CartStoreImpl implements CartStore {
  private static instance: CartStoreImpl
  public items: CartItem[] = []
  private listeners: (() => void)[] = []

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): CartStoreImpl {
    if (!CartStoreImpl.instance) {
      CartStoreImpl.instance = new CartStoreImpl()
    }
    return CartStoreImpl.instance
  }

  private loadFromStorage() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("cart")
        if (stored) {
          this.items = JSON.parse(stored)
        }
      } catch (error) {
        console.error("Error loading cart from storage:", error)
        this.items = []
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("cart", JSON.stringify(this.items))
        this.notifyListeners()
      } catch (error) {
        console.error("Error saving cart to storage:", error)
      }
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener())
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  addItem(product: any) {
    const existingItem = this.items.find((item) => item.id === product.id)

    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        existingItem.quantity += 1
      }
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        quantity: 1,
        image: product.image || "/placeholder.svg?height=200&width=200",
        category: product.category,
        stock: product.stock,
      })
    }

    this.saveToStorage()
  }

  removeItem(id: string) {
    this.items = this.items.filter((item) => item.id !== id)
    this.saveToStorage()
  }

  updateQuantity(id: string, quantity: number) {
    const item = this.items.find((item) => item.id === id)
    if (item) {
      if (quantity <= 0) {
        this.removeItem(id)
      } else if (quantity <= item.stock) {
        item.quantity = quantity
        this.saveToStorage()
      }
    }
  }

  clearCart() {
    this.items = []
    this.saveToStorage()
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0)
  }
}

export const cartStore = CartStoreImpl.getInstance()
