"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Star, ShoppingCart, Filter, Search, Eye } from "lucide-react"
import { useProducts } from "@/lib/product-store"
import { useCart } from "@/hooks/use-cart"
import { toast } from "sonner"

export default function ProductsPage() {
  const { products, getActiveProducts, getProductsByCategory, searchProducts } = useProducts()
  const { addItem } = useCart()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const categories = ["All", "Electronics", "Accessories", "Office", "Home"]

  // Filter products based on category and search
  let filteredProducts = products

  if (selectedCategory !== "All") {
    filteredProducts = getProductsByCategory(selectedCategory)
  }

  if (searchQuery) {
    filteredProducts = searchProducts(searchQuery)
  }

  // Only show active products with stock > 0 to customers
  const displayProducts = filteredProducts.filter((product) => product.status === "active" || product.stock > 0)

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking add to cart
    e.stopPropagation()
    addItem(product)
    toast.success(`Added ${product.name} to cart!`)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Our Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Discover our amazing collection of high-quality products - Updated in real-time!
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={
                    selectedCategory === category
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg transform scale-105"
                      : "bg-white/80 text-gray-700 hover:bg-white border border-gray-200 shadow-sm hover:shadow-md transform hover:scale-105 dark:bg-gray-800/80 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {displayProducts.length} product{displayProducts.length !== 1 ? "s" : ""}
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg group cursor-pointer"
            >
              <Link href={`/products/${product.id}`}>
                <div className="relative">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                    <img
                      src={product.image || "/placeholder.svg?height=200&width=200"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      style={{ minHeight: '100%', minWidth: '100%' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg?height=200&width=200";
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white dark:bg-gray-800 rounded-full p-2">
                        <Eye className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      </div>
                    </div>
                  </div>
                  {product.badge && (
                    <Badge
                      className={`absolute top-2 left-2 ${
                        product.badge === "Sale"
                          ? "bg-red-500"
                          : product.badge === "New"
                            ? "bg-green-500"
                            : product.badge === "Best Seller"
                              ? "bg-blue-500"
                              : "bg-purple-500"
                      }`}
                    >
                      {product.badge}
                    </Badge>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold">Out of Stock</span>
                    </div>
                  )}
                  {product.stock > 0 && product.stock < 10 && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500">Only {product.stock} left!</Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-200">
                    {product.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="flex">{renderStars(product.rating || 4.0)}</div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">({product.reviews || 0} reviews)</span>
                  </div>
                </CardHeader>
              </Link>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link href={`/products/${product.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center space-x-1 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:border-blue-800 dark:hover:text-blue-400 transition-all duration-200"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    disabled={product.stock === 0}
                    onClick={(e) => handleAddToCart(product, e)}
                    className="flex items-center space-x-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span className="hidden sm:inline">{product.stock === 0 ? "Out of Stock" : "Add"}</span>
                  </Button>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Stock: {product.stock} | Category: {product.category}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {displayProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery
                  ? `No products match "${searchQuery}"`
                  : `No products found in ${selectedCategory} category`}
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("All")
                }}
                variant="outline"
              >
                Clear filters
              </Button>
            </div>
          </div>
        )}

        {/* Live Update Notice */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Live Updates:</strong> Products are automatically updated when admins make changes in the
              dashboard!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
