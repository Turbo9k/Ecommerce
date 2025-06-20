"use client"

import { ProductStore } from "@/lib/product-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminReset() {
  const handleReset = () => {
    const store = ProductStore.getInstance()
    store.resetToDefaults()
    alert("Product images have been updated! Please refresh the page.")
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
        <CardContent>
          <Button onClick={handleReset} className="w-full">
            Update Product Images
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
