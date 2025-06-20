"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { orderStore } from "@/lib/order-store"
import { User, Package, CreditCard, Settings, Truck, CheckCircle, Clock, XCircle, Eye, MapPin, Calendar, Phone } from "lucide-react"

export function AccountOverview() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [userOrders, setUserOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [showTracking, setShowTracking] = useState(false)
  const [shippingInfo, setShippingInfo] = useState<any>(null)
  const [loadingShipping, setLoadingShipping] = useState(false)

  useEffect(() => {
    if (user) {
      // Load initial orders
      const orders = orderStore.getOrdersByUserId(user.id)
      setUserOrders(orders)

      // Subscribe to order changes
      const unsubscribe = orderStore.subscribe(() => {
        const updatedOrders = orderStore.getOrdersByUserId(user.id)
        setUserOrders(updatedOrders)
      })

      return unsubscribe
    }
  }, [user])

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
        return <Clock className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handleViewDetails = async (order: any) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
    setShippingInfo(null)
    
    // Fetch shipping information from Stripe if we have a session ID
    if (order.stripeSessionId) {
      setLoadingShipping(true)
      try {
        const response = await fetch("/api/get-order-details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId: order.stripeSessionId }),
        })
        
        if (response.ok) {
          const data = await response.json()
          setShippingInfo(data.shippingInfo)
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

  const handleTrackOrder = (order: any) => {
    setSelectedOrder(order)
    setShowTracking(true)
  }

  const getTrackingSteps = (status: string) => {
    const steps = [
      { id: 'ordered', label: 'Order Placed', description: 'Your order has been received', completed: true },
      { id: 'processing', label: 'Processing', description: 'We\'re preparing your order', completed: ['processing', 'shipped', 'delivered'].includes(status) },
      { id: 'shipped', label: 'Shipped', description: 'Your order is on its way', completed: ['shipped', 'delivered'].includes(status) },
      { id: 'delivered', label: 'Delivered', description: 'Your order has been delivered', completed: status === 'delivered' }
    ]
    return steps
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <User className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Overview</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account and view your orders</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Orders ({userOrders.length})</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Payment</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={user?.name || ""}
                    disabled={!isEditing}
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled={!isEditing}
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    disabled={!isEditing}
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main St, City, State 12345"
                    disabled={!isEditing}
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
              </div>
              {isEditing && (
                <div className="flex space-x-2">
                  <Button>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order History</span>
                <Badge variant="outline">{userOrders.length} orders</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    When you place your first order, it will appear here.
                  </p>
                  <Button onClick={() => (window.location.href = "/products")}>Start Shopping</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">Order {order.id}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
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
                          <p className="font-semibold text-lg mt-1">${order.total.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Items:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

                      <div className="flex justify-between items-center pt-2 border-t">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(order)}>
                          View Details
                        </Button>
                        {order.status === "delivered" && (
                          <Button variant="outline" size="sm">
                            Reorder
                          </Button>
                        )}
                        {(order.status === "pending" || order.status === "processing") && (
                          <Button variant="outline" size="sm" onClick={() => handleTrackOrder(order)}>
                            Track Order
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Expires 12/25</p>
                  </div>
                </div>
                <Badge>Default</Badge>
              </div>
              <Button variant="outline" className="w-full">
                Add New Payment Method
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates about your orders</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Privacy Settings</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage your data and privacy preferences</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Delete Account</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Permanently delete your account and data</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order Details - {selectedOrder.id}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowOrderDetails(false)}>
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
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
                ) : shippingInfo?.formattedAddress ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{shippingInfo.shipping.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {shippingInfo.formattedAddress.line1}
                          {shippingInfo.formattedAddress.line2 && <br />}
                          {shippingInfo.formattedAddress.line2}
                          <br />
                          {shippingInfo.formattedAddress.city}, {shippingInfo.formattedAddress.state} {shippingInfo.formattedAddress.postal_code}
                          <br />
                          {shippingInfo.formattedAddress.country}
                        </p>
                        {shippingInfo.shipping.phone !== 'N/A' && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            📞 {shippingInfo.shipping.phone}
                          </p>
                        )}
                        {shippingInfo.shipping.email !== 'N/A' && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ✉️ {shippingInfo.shipping.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : shippingInfo?.rawSession ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">Debug: Raw Session Data Available</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Check console for detailed shipping information
                        </p>
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-blue-600">View Raw Data</summary>
                          <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(shippingInfo.rawSession, null, 2)}
                          </pre>
                        </details>
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

      {/* Tracking Modal */}
      {showTracking && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Track Order - {selectedOrder.id}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowTracking(false)}>
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Truck className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-medium">Order Status: {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}</p>
                    {selectedOrder.trackingNumber && (
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Tracking: {selectedOrder.trackingNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div>
                <h3 className="font-semibold mb-4">Order Progress</h3>
                <div className="space-y-4">
                  {getTrackingSteps(selectedOrder.status).map((step, index) => (
                    <div key={step.id} className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${step.completed ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          {step.label}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
                        {step.completed && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Completed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Estimated Delivery</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedOrder.status === 'delivered' 
                        ? 'Delivered on ' + new Date(selectedOrder.createdAt).toLocaleDateString()
                        : '3-5 business days from order date'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Support */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Need Help?</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Contact our support team if you have any questions about your order.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
