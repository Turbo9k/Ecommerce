"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useProducts } from "@/lib/product-store"
import { orderStore } from "@/lib/order-store"
import { userStorage } from "@/lib/user-storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import {
  Package,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  ShoppingCart,
  Star,
  Calendar,
  Activity,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
} from "lucide-react"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  description: string
  image: string
  category: string
  stock: number
  rating: number
  reviews: number
  badge?: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { products, addProduct, updateProduct, deleteProduct } = useProducts()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [userStats, setUserStats] = useState({ total: 0, recent: [] as any[] })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [orderStats, setOrderStats] = useState<any>({})
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [showContactCustomer, setShowContactCustomer] = useState(false)
  const [shippingInfo, setShippingInfo] = useState<any>(null)
  const [loadingShipping, setLoadingShipping] = useState(false)

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    originalPrice: 0,
    description: "",
    image: "",
    category: "",
    stock: 0,
    rating: 5,
    reviews: 0,
    badge: "",
  })

  useEffect(() => {
    // Load user statistics
    const totalUsers = userStorage.getUserCount()
    const recentUsers = userStorage.getRecentUsers(5)
    setUserStats({ total: totalUsers, recent: recentUsers })

    // Load order statistics
    const loadOrderData = () => {
      const orders = orderStore.getRecentOrders(10)
      const stats = orderStore.getOrderStats()
      setRecentOrders(orders)
      setOrderStats(stats)
    }

    loadOrderData()

    // Subscribe to order changes
    const unsubscribe = orderStore.subscribe(() => {
      loadOrderData()
    })

    return unsubscribe
  }, [])

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-400">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.price > 0) {
      const product: Product = {
        id: Math.random().toString(36).substr(2, 9),
        ...newProduct,
        image: newProduct.image || `/placeholder.svg?height=300&width=300`,
      }
      addProduct(product)
      setNewProduct({
        name: "",
        price: 0,
        originalPrice: 0,
        description: "",
        image: "",
        category: "",
        stock: 0,
        rating: 5,
        reviews: 0,
        badge: "",
      })
      setShowAddForm(false)
    }
  }

  const handleUpdateProduct = () => {
    if (editingProduct) {
      updateProduct(editingProduct.id, editingProduct)
      setEditingProduct(null)
    }
  }

  const handleUpdateOrderStatus = (orderId: string, newStatus: string, trackingNumber?: string) => {
    const order = orderStore.getOrderById(orderId)
    if (!order) return

    const previousStatus = order.status

    // Handle inventory adjustments for cancelled orders
    if (newStatus === "cancelled" && previousStatus !== "cancelled") {
      // Restore inventory when order is cancelled
      order.items.forEach((item) => {
        const product = products.find((p) => p.id === item.id)
        if (product) {
          const newStock = product.stock + item.quantity
          updateProduct(item.id, { ...product, stock: newStock })
        }
      })
      toast.success("Order cancelled and inventory restored!")
    }

    orderStore.updateOrderStatus(orderId, newStatus as any, trackingNumber)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "pending":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "processing":
        return <Clock className="h-4 w-4" />
      case "pending":
        return <AlertCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const totalRevenue = orderStats.totalRevenue || 0
  const lowStockProducts = products.filter((product) => product.stock < 10)

  const handleViewOrderDetails = async (order: any) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
    setShippingInfo(null)
    
    // Fetch shipping information from Stripe if we have a session ID
    if (order.stripeSessionId) {
      setLoadingShipping(true)
      try {
        const response = await fetch('/api/get-order-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: order.stripeSessionId
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          setShippingInfo(data)
        } else {
          console.error('Failed to fetch shipping info')
        }
      } catch (error) {
        console.error('Error fetching shipping info:', error)
      } finally {
        setLoadingShipping(false)
      }
    }
  }

  const handleContactCustomer = (order: any) => {
    setSelectedOrder(order)
    setShowContactCustomer(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user.name}! Here's what's happening with your store.
          </p>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
              🌟 All changes you make here will be reflected store-wide in real-time!
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders ({recentOrders.length})
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
                      <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Orders</p>
                      <p className="text-3xl font-bold">{orderStats.total || 0}</p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Total Users</p>
                      <p className="text-3xl font-bold">{userStats.total}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Products</p>
                      <p className="text-3xl font-bold">{products.length}</p>
                    </div>
                    <Package className="h-8 w-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Low Stock Alert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lowStockProducts.length > 0 ? (
                    <div className="space-y-3">
                      {lowStockProducts.slice(0, 3).map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-red-800 dark:text-red-200">{product.name}</p>
                            <p className="text-sm text-red-600 dark:text-red-400">Only {product.stock} left</p>
                          </div>
                          <Badge variant="destructive">{product.stock}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-green-600 dark:text-green-400">All products are well stocked! 🎉</p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Order Status Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending</span>
                      <Badge variant="outline">{orderStats.pending || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Processing</span>
                      <Badge className="bg-yellow-100 text-yellow-800">{orderStats.processing || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Shipped</span>
                      <Badge className="bg-blue-100 text-blue-800">{orderStats.shipped || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Delivered</span>
                      <Badge className="bg-green-100 text-green-800">{orderStats.delivered || 0}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Order Management</h2>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {recentOrders.length} recent orders
              </Badge>
            </div>

            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Card key={order.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">Order {order.id}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Customer: {order.userName} ({order.userEmail})
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Placed: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        {order.trackingNumber && (
                          <p className="text-sm text-blue-600 dark:text-blue-400">Tracking: {order.trackingNumber}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(order.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </Badge>
                        <p className="font-semibold text-xl mt-1">${order.total.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="border-t pt-4 mb-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Items:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {order.items.map((item: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                          >
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex items-center space-x-4">
                        <div>
                          <label className="text-sm font-medium">Update Status:</label>
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-40 mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {order.status === "shipped" && (
                          <div>
                            <label className="text-sm font-medium">Tracking Number:</label>
                            <Input
                              placeholder="Enter tracking number"
                              className="w-48 mt-1"
                              onBlur={(e) => {
                                if (e.target.value) {
                                  handleUpdateOrderStatus(order.id, "shipped", e.target.value)
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewOrderDetails(order)}>
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleContactCustomer(order)}>
                          Contact Customer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            {/* Add Product Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Product Management</h2>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            {/* Add Product Form */}
            {showAddForm && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Add New Product</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Product Name</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="Enter product name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      >
                        <option value="">Select category</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Home">Home</option>
                        <option value="Books">Books</option>
                        <option value="Sports">Sports</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Price ($)</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                        value={newProduct.price}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, price: Number.parseFloat(e.target.value) || 0 })
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Original Price ($)</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                        value={newProduct.originalPrice}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, originalPrice: Number.parseFloat(e.target.value) || 0 })
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Stock</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: Number.parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Badge</label>
                      <select
                        className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                        value={newProduct.badge}
                        onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                      >
                        <option value="">No badge</option>
                        <option value="New">New</option>
                        <option value="Sale">Sale</option>
                        <option value="Hot">Hot</option>
                        <option value="Limited">Limited</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                      rows={3}
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="Enter product description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Image URL</label>
                    <input
                      type="url"
                      className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                      value={newProduct.image}
                      onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                      placeholder="https://example.com/image.jpg (optional)"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddProduct} className="bg-green-600 hover:bg-green-700">
                      Add Product
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-4">
                    <div className="relative mb-4">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {product.badge && (
                        <Badge className="absolute top-2 left-2" variant="secondary">
                          {product.badge}
                        </Badge>
                      )}
                      {product.stock < 10 && (
                        <Badge className="absolute top-2 right-2" variant="destructive">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-green-600">${product.price}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{product.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline">{product.category}</Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Stock: {product.stock}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingProduct(product)} className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteProduct(product.id)}
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Edit Product Modal */}
            {editingProduct && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <CardHeader>
                    <CardTitle>Edit Product</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Product Name</label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select
                          className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        >
                          <option value="Electronics">Electronics</option>
                          <option value="Clothing">Clothing</option>
                          <option value="Home">Home</option>
                          <option value="Books">Books</option>
                          <option value="Sports">Sports</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Price ($)</label>
                        <input
                          type="number"
                          className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                          value={editingProduct.price}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, price: Number.parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Stock</label>
                        <input
                          type="number"
                          className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                          value={editingProduct.stock}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, stock: Number.parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Image URL</label>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                          value={editingProduct.image}
                          onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter a valid image URL (Unsplash, etc.) or leave empty for placeholder
                        </p>
                        {/* Image Preview */}
                        {editingProduct.image && (
                          <div className="mt-3">
                            <label className="block text-sm font-medium mb-2">Image Preview:</label>
                            <div className="w-32 h-32 border rounded-lg overflow-hidden">
                              <img
                                src={editingProduct.image}
                                alt="Product preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg?height=128&width=128";
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                        rows={3}
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateProduct} className="bg-blue-600 hover:bg-blue-700">
                        Update Product
                      </Button>
                      <Button variant="outline" onClick={() => setEditingProduct(null)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Management</h2>
              <Badge variant="outline" className="text-lg px-3 py-1">
                Total: {userStats.total} users
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userStats.recent.map((user) => (
                <Card key={user.id} className="shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{user.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{user.email}</p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Store Analytics</h2>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Total Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      revenue: {
                        label: "Revenue",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <LineChart data={[
                      { month: "Jan", revenue: 12000 },
                      { month: "Feb", revenue: 15000 },
                      { month: "Mar", revenue: 18000 },
                      { month: "Apr", revenue: 22000 },
                      { month: "May", revenue: 25000 },
                      { month: "Jun", revenue: totalRevenue },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--chart-1))" }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Total Orders Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      orders: {
                        label: "Orders",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <BarChart data={[
                      { month: "Jan", orders: 45 },
                      { month: "Feb", orders: 52 },
                      { month: "Mar", orders: 61 },
                      { month: "Apr", orders: 78 },
                      { month: "May", orders: 89 },
                      { month: "Jun", orders: orderStats.total || 0 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="orders"
                        fill="hsl(var(--chart-2))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Revenue</span>
                      <span className="font-bold text-green-600">${totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Order Value</span>
                      <span className="font-bold">
                        ${orderStats.total > 0 ? (totalRevenue / orderStats.total).toFixed(2) : "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Orders</span>
                      <span className="font-bold">{orderStats.total || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Order Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Pending Orders</span>
                      <span className="font-bold text-gray-600">{orderStats.pending || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Processing Orders</span>
                      <span className="font-bold text-yellow-600">{orderStats.processing || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Shipped Orders</span>
                      <span className="font-bold text-blue-600">{orderStats.shipped || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Delivered Orders</span>
                      <span className="font-bold text-green-600">{orderStats.delivered || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order Details - {selectedOrder.id}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowOrderDetails(false)}>
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Order Date</p>
                    <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                    <p className="font-medium text-lg">${selectedOrder.total.toFixed(2)}</p>
                  </div>
                  {selectedOrder.trackingNumber && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tracking Number</p>
                      <p className="font-medium text-blue-600 dark:text-blue-400">{selectedOrder.trackingNumber}</p>
                    </div>
                  )}
                  {shippingInfo?.paymentStatus && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Payment Status</p>
                      <Badge className={shippingInfo.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}>
                        {shippingInfo.paymentStatus.charAt(0).toUpperCase() + shippingInfo.paymentStatus.slice(1)}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Customer Name</p>
                      <p className="font-medium">{selectedOrder.userName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="font-medium">{selectedOrder.userEmail}</p>
                    </div>
                    {shippingInfo?.phone && shippingInfo.phone !== 'N/A' && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                        <p className="font-medium">{shippingInfo.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Quantity: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Information */}
              <div>
                <h3 className="font-semibold mb-3">Shipping Information</h3>
                {loadingShipping ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Loading shipping details...</p>
                    </div>
                  </div>
                ) : shippingInfo && shippingInfo.address ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{shippingInfo.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {shippingInfo.address.line1 || ''}
                          {shippingInfo.address.line2 && <br />}
                          {shippingInfo.address.line2}
                          <br />
                          {shippingInfo.address.city}, {shippingInfo.address.state} {shippingInfo.address.postal_code}
                          <br />
                          {shippingInfo.address.country}
                        </p>
                        {shippingInfo.phone && shippingInfo.phone !== 'N/A' && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            📞 {shippingInfo.phone}
                          </p>
                        )}
                        {shippingInfo.email && shippingInfo.email !== 'N/A' && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ✉️ {shippingInfo.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Shipping Address</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Address information not available
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contact Customer Modal */}
      {showContactCustomer && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Contact Customer - {selectedOrder.userName}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowContactCustomer(false)}>
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Customer Name</p>
                    <p className="font-medium">{selectedOrder.userName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium">{selectedOrder.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Order ID</p>
                    <p className="font-medium">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Order Total</p>
                    <p className="font-medium">${selectedOrder.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Contact Methods */}
              <div>
                <h3 className="font-semibold mb-3">Contact Methods</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        ✉️
                      </div>
                      <div>
                        <p className="font-medium">Email Customer</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Send email to {selectedOrder.userEmail}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${selectedOrder.userEmail}?subject=Order ${selectedOrder.id} - Update`, '_blank')}>
                      Send Email
                    </Button>
                  </div>
                  
                  {shippingInfo?.phone && shippingInfo.phone !== 'N/A' && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          📞
                        </div>
                        <div>
                          <p className="font-medium">Call Customer</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Call {shippingInfo.phone}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => window.open(`tel:${shippingInfo.phone}`, '_blank')}>
                        Call Now
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                        💬
                      </div>
                      <div>
                        <p className="font-medium">Send SMS</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Send text message</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                      const phone = shippingInfo?.phone || 'N/A'
                      if (phone !== 'N/A') {
                        window.open(`sms:${phone}?body=Hi ${selectedOrder.userName}, regarding your order ${selectedOrder.id}`, '_blank')
                      } else {
                        alert('Phone number not available')
                      }
                    }}>
                      Send SMS
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="font-semibold mb-3">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => {
                    const subject = `Order ${selectedOrder.id} - Shipping Update`
                    const body = `Hi ${selectedOrder.userName},\n\nYour order ${selectedOrder.id} has been updated.\n\nThank you for your business!\n\nBest regards,\nYour Store Team`
                    window.open(`mailto:${selectedOrder.userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank')
                  }}>
                    Send Shipping Update
                  </Button>
                  <Button variant="outline" onClick={() => {
                    const subject = `Order ${selectedOrder.id} - Delivery Confirmation`
                    const body = `Hi ${selectedOrder.userName},\n\nYour order ${selectedOrder.id} has been delivered!\n\nThank you for your purchase.\n\nBest regards,\nYour Store Team`
                    window.open(`mailto:${selectedOrder.userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank')
                  }}>
                    Send Delivery Confirmation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
