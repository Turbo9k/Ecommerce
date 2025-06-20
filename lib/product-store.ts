"use client"

// Global product store using localStorage for persistence
export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  category: string
  stock: number
  status: "active" | "inactive" | "out_of_stock"
  description: string
  image?: string
  rating?: number
  reviews?: number
  badge?: string
}

// Initial sample products
const initialProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    price: 99.99,
    originalPrice: 129.99,
    category: "Electronics",
    stock: 45,
    status: "active",
    description: "High-quality wireless headphones with noise cancellation",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center",
    rating: 4.5,
    reviews: 128,
    badge: "Best Seller",
  },
  {
    id: "2",
    name: "Smartphone Case",
    price: 24.99,
    originalPrice: 34.99,
    category: "Accessories",
    stock: 23,
    status: "active",
    description: "Durable protective case for your smartphone",
    image: "https://images.unsplash.com/photo-1601593346740-925612772716?w=400&h=400&fit=crop&crop=center",
    rating: 4.2,
    reviews: 89,
    badge: "Sale",
  },
  {
    id: "3",
    name: "Laptop Stand",
    price: 49.99,
    category: "Office",
    stock: 67,
    status: "active",
    description: "Ergonomic laptop stand for better posture",
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop&crop=center",
    rating: 4.7,
    reviews: 156,
    badge: "New",
  },
  {
    id: "4",
    name: "USB-C Cable",
    price: 19.99,
    category: "Electronics",
    stock: 0,
    status: "out_of_stock",
    description: "Fast charging USB-C cable, 6ft length",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=400&fit=crop&crop=center",
    rating: 4.3,
    reviews: 203,
  },
  {
    id: "5",
    name: "Bluetooth Speaker",
    price: 79.99,
    originalPrice: 99.99,
    category: "Electronics",
    stock: 12,
    status: "active",
    description: "Portable Bluetooth speaker with premium sound",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop&crop=center",
    rating: 4.6,
    reviews: 94,
    badge: "Sale",
  },
  {
    id: "6",
    name: "Desk Organizer",
    price: 34.99,
    category: "Office",
    stock: 28,
    status: "active",
    description: "Bamboo desk organizer with multiple compartments",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center",
    rating: 4.4,
    reviews: 67,
  },
]

const PRODUCTS_STORAGE_KEY = "ecommerce_products"

export class ProductStore {
  private static instance: ProductStore
  private products: Product[] = []
  private listeners: Array<(products: Product[]) => void> = []

  private constructor() {
    this.loadProducts()
  }

  static getInstance(): ProductStore {
    if (!ProductStore.instance) {
      ProductStore.instance = new ProductStore()
    }
    return ProductStore.instance
  }

  private loadProducts(): void {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY)
      if (stored) {
        try {
          this.products = JSON.parse(stored)
        } catch (error) {
          console.error("Error loading products from storage:", error)
          this.products = [...initialProducts]
          this.saveProducts()
        }
      } else {
        this.products = [...initialProducts]
        this.saveProducts()
      }
    } else {
      this.products = [...initialProducts]
    }
  }

  private saveProducts(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(this.products))
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener([...this.products]))
  }

  getProducts(): Product[] {
    return [...this.products]
  }

  getProduct(id: string): Product | undefined {
    return this.products.find((p) => p.id === id)
  }

  addProduct(product: Omit<Product, "id">): Product {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      image: product.image || "/placeholder.svg?height=200&width=200",
      rating: product.rating || 4.0,
      reviews: product.reviews || 0,
    }
    this.products.push(newProduct)
    this.saveProducts()
    this.notifyListeners()
    return newProduct
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.products.findIndex((p) => p.id === id)
    if (index === -1) return null

    this.products[index] = { ...this.products[index], ...updates }
    this.saveProducts()
    this.notifyListeners()
    return this.products[index]
  }

  deleteProduct(id: string): boolean {
    const index = this.products.findIndex((p) => p.id === id)
    if (index === -1) return false

    this.products.splice(index, 1)
    this.saveProducts()
    this.notifyListeners()
    return true
  }

  resetToDefaults(): void {
    this.products = [...initialProducts]
    this.saveProducts()
    this.notifyListeners()
  }

  updateStock(id: string, newStock: number): Product | null {
    const product = this.products.find((p) => p.id === id)
    if (!product) return null

    product.stock = newStock
    product.status = newStock === 0 ? "out_of_stock" : "active"
    this.saveProducts()
    this.notifyListeners()
    return product
  }

  subscribe(listener: (products: Product[]) => void): () => void {
    this.listeners.push(listener)
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // Filter methods for convenience
  getActiveProducts(): Product[] {
    return this.products.filter((p) => p.status === "active" && p.stock > 0)
  }

  getProductsByCategory(category: string): Product[] {
    return this.products.filter((p) => p.category === category)
  }

  searchProducts(query: string): Product[] {
    const lowercaseQuery = query.toLowerCase()
    return this.products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowercaseQuery) ||
        p.description.toLowerCase().includes(lowercaseQuery) ||
        p.category.toLowerCase().includes(lowercaseQuery),
    )
  }
}

// React hook for using the product store
import { useEffect, useState } from "react"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const store = ProductStore.getInstance()
    setProducts(store.getProducts())
    setIsLoading(false)

    const unsubscribe = store.subscribe((updatedProducts) => {
      setProducts(updatedProducts)
    })

    return unsubscribe
  }, [])

  const store = ProductStore.getInstance()

  return {
    products,
    isLoading,
    addProduct: (product: Omit<Product, "id">) => store.addProduct(product),
    updateProduct: (id: string, updates: Partial<Product>) => store.updateProduct(id, updates),
    deleteProduct: (id: string) => store.deleteProduct(id),
    updateStock: (id: string, stock: number) => store.updateStock(id, stock),
    getProduct: (id: string) => store.getProduct(id),
    getActiveProducts: () => store.getActiveProducts(),
    getProductsByCategory: (category: string) => store.getProductsByCategory(category),
    searchProducts: (query: string) => store.searchProducts(query),
  }
}
