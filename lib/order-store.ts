interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface Order {
  id: string
  userId: string
  userEmail: string
  userName: string
  items: OrderItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  createdAt: string
  updatedAt: string
  shippingAddress?: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  stripeSessionId?: string
  trackingNumber?: string
}

class OrderStore {
  private static instance: OrderStore
  private orders: Order[] = []
  private listeners: (() => void)[] = []

  private constructor() {
    this.loadOrders()
  }

  static getInstance(): OrderStore {
    if (!OrderStore.instance) {
      OrderStore.instance = new OrderStore()
    }
    return OrderStore.instance
  }

  private loadOrders() {
    if (typeof window !== "undefined") {
      try {
        const storedOrders = localStorage.getItem("orders")
        if (storedOrders) {
          this.orders = JSON.parse(storedOrders)
        } else {
          // Initialize with some demo orders
          this.orders = [
            {
              id: "ORD-001",
              userId: "2",
              userEmail: "customer@example.com",
              userName: "Customer User",
              items: [
                {
                  id: "1",
                  name: "Wireless Headphones",
                  price: 99.99,
                  quantity: 1,
                  image: "/placeholder.svg?height=300&width=300",
                },
              ],
              total: 99.99,
              status: "delivered",
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              trackingNumber: "TRK123456789",
            },
            {
              id: "ORD-002",
              userId: "2",
              userEmail: "customer@example.com",
              userName: "Customer User",
              items: [
                {
                  id: "2",
                  name: "Smartphone Case",
                  price: 24.99,
                  quantity: 2,
                  image: "/placeholder.svg?height=300&width=300",
                },
              ],
              total: 49.98,
              status: "processing",
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ]
          this.saveOrders()
        }
      } catch (error) {
        console.error("Error loading orders:", error)
        this.orders = []
      }
    }
  }

  private saveOrders() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("orders", JSON.stringify(this.orders))
        this.notifyListeners()
      } catch (error) {
        console.error("Error saving orders:", error)
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

  createOrder(orderData: Omit<Order, "id" | "createdAt" | "updatedAt">): Order {
    const order: Order = {
      ...orderData,
      id: `ORD-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.orders.unshift(order) // Add to beginning for recent orders
    this.saveOrders()
    return order
  }

  getOrdersByUserId(userId: string): Order[] {
    return this.orders
      .filter((order) => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  getAllOrders(): Order[] {
    return [...this.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  getRecentOrders(limit = 10): Order[] {
    return this.getAllOrders().slice(0, limit)
  }

  updateOrderStatus(orderId: string, status: Order["status"], trackingNumber?: string): boolean {
    const orderIndex = this.orders.findIndex((order) => order.id === orderId)
    if (orderIndex !== -1) {
      this.orders[orderIndex].status = status
      this.orders[orderIndex].updatedAt = new Date().toISOString()
      if (trackingNumber) {
        this.orders[orderIndex].trackingNumber = trackingNumber
      }
      this.saveOrders()
      return true
    }
    return false
  }

  getOrderById(orderId: string): Order | null {
    return this.orders.find((order) => order.id === orderId) || null
  }

  getOrderItems(orderId: string): OrderItem[] {
    const order = this.getOrderById(orderId)
    return order ? order.items : []
  }

  updateOrderWithInventoryAdjustment(orderId: string, newStatus: string, previousStatus: string): boolean {
    const order = this.getOrderById(orderId)
    if (!order) return false

    // If order is being cancelled, we should restore inventory
    if (newStatus === "cancelled" && previousStatus !== "cancelled") {
      // This will be handled by the component that calls this method
      // to avoid circular dependencies
    }

    return this.updateOrderStatus(orderId, newStatus as any)
  }

  getOrderStats() {
    const total = this.orders.length
    const pending = this.orders.filter((o) => o.status === "pending").length
    const processing = this.orders.filter((o) => o.status === "processing").length
    const shipped = this.orders.filter((o) => o.status === "shipped").length
    const delivered = this.orders.filter((o) => o.status === "delivered").length
    const cancelled = this.orders.filter((o) => o.status === "cancelled").length
    const totalRevenue = this.orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, order) => sum + order.total, 0)

    return {
      total,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
      totalRevenue,
    }
  }
}

export const orderStore = OrderStore.getInstance()
