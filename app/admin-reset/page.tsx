"use client"

import { ProductStore } from "@/lib/product-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function AdminResetPage() {
  const router = useRouter()

  const handleReset = () => {
    // Clear localStorage directly
    localStorage.removeItem("ecommerce_products")

    // Force refresh product store
    const store = ProductStore.getInstance()
    store.resetToDefaults()

    alert("Product images have been updated! The page will now refresh.")

    // Force a hard refresh
    window.location.href = "/products"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Update Product Images</CardTitle>
          <CardDescription>
            Click the button below to refresh all product images with the latest versions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleReset} className="w-full">
            Update Product Images
          </Button>

          <div className="text-sm text-gray-500 mt-4">
            <p>This will:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Clear cached product data</li>
              <li>Update all product images</li>
              <li>Redirect you to the products page</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
