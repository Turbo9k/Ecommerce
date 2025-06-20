import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedBackground } from "@/components/animated-background"
import { FloatingShapes } from "@/components/floating-shapes"
import { WaveBackground } from "@/components/wave-background"
import {
  ShoppingBag,
  Shield,
  Truck,
  CreditCard,
  Star,
  Users,
  Award,
  Zap,
  Heart,
  TrendingUp,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Gift,
  Crown,
  Rocket,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <AnimatedBackground />
      <FloatingShapes />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-gray-900/90 dark:via-blue-900/50 dark:to-purple-900/50"></div>

        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <div className="absolute inset-0 bg-grid-pattern animate-grid-move"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center z-10">
          {/* Floating Badge */}
          <div className="flex justify-center mb-8 animate-bounce-in">
            <div className="flex items-center space-x-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-xl animate-glow">
              <Crown className="h-5 w-5 text-yellow-500 animate-spin-slow" />
              <span className="text-sm font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Premium Shopping Experience
              </span>
              <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
            </div>
          </div>

          {/* Main Heading with Typewriter Effect */}
          <h1 className="text-5xl font-bold sm:text-8xl mb-8 animate-fade-in-up">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
              Welcome to our platform
            </span>
          </h1>

          {/* Subtitle with Stagger Animation */}
          <p className="mt-6 text-xl max-w-4xl mx-auto text-gray-600 dark:text-gray-300 leading-relaxed animate-fade-in-up delay-200">
            Discover amazing products with{" "}
            <span className="font-bold text-blue-600 dark:text-blue-400 animate-pulse">secure payments</span>,
            <span className="font-bold text-purple-600 dark:text-purple-400 animate-pulse delay-100">
              {" "}
              real-time inventory tracking
            </span>
            , and
            <span className="font-bold text-pink-600 dark:text-pink-400 animate-pulse delay-200">
              {" "}
              exceptional customer service
            </span>
            . Your one-stop shop for everything you need.
          </p>

          {/* CTA Buttons with Hover Animations */}
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up delay-400">
            <Link href="/products">
              <Button
                size="lg"
                className="group px-10 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-500 animate-pulse-glow"
              >
                <ShoppingBag className="h-6 w-6 mr-3 group-hover:animate-bounce" />
                Shop Now
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                className="group px-10 py-6 bg-white/95 text-gray-900 hover:bg-white border-2 border-gray-200 hover:border-purple-300 shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-500 dark:bg-gray-800/95 dark:text-white dark:border-gray-600 dark:hover:border-purple-500"
              >
                <Rocket className="h-6 w-6 mr-3 group-hover:animate-bounce" />
                Join Free
                <Sparkles className="h-5 w-5 ml-2 group-hover:animate-spin transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex justify-center items-center space-x-12 text-sm text-gray-500 dark:text-gray-400 animate-fade-in-up delay-600">
            <div className="flex items-center space-x-2 animate-bounce-in delay-700">
              <CheckCircle className="h-5 w-5 text-green-500 animate-pulse" />
              <span className="font-medium">Free Shipping</span>
            </div>
            <div className="flex items-center space-x-2 animate-bounce-in delay-800">
              <CheckCircle className="h-5 w-5 text-green-500 animate-pulse" />
              <span className="font-medium">30-Day Returns</span>
            </div>
            <div className="flex items-center space-x-2 animate-bounce-in delay-900">
              <CheckCircle className="h-5 w-5 text-green-500 animate-pulse" />
              <span className="font-medium">24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Wave Background */}
        <WaveBackground />
      </section>

      {/* Floating Stats Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-4 hover:rotate-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl group animate-slide-in-left">
              <CardContent className="p-10">
                <div className="flex justify-center mb-6">
                  <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full group-hover:scale-125 transition-transform duration-500 animate-float">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h3 className="text-5xl font-bold text-gray-900 dark:text-white mb-3 animate-count-up">10,000+</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">Happy Customers</p>
                <div className="mt-6 flex justify-center">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-400 fill-current animate-twinkle"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-4 hover:-rotate-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl group animate-slide-in-up delay-200">
              <CardContent className="p-10">
                <div className="flex justify-center mb-6">
                  <div className="p-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full group-hover:scale-125 transition-transform duration-500 animate-float delay-500">
                    <Star className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h3 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">4.9/5</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">Customer Rating</p>
                <div className="mt-6">
                  <span className="text-sm text-green-600 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full animate-pulse">
                    Excellent Reviews
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-4 hover:rotate-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl group animate-slide-in-right delay-400">
              <CardContent className="p-10">
                <div className="flex justify-center mb-6">
                  <div className="p-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full group-hover:scale-125 transition-transform duration-500 animate-float delay-1000">
                    <Award className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h3 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">99.9%</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">Uptime Guarantee</p>
                <div className="mt-6">
                  <span className="text-sm text-green-600 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full animate-pulse">
                    Always Available
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/30 to-pink-50/30 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
                Us?
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              We provide the best shopping experience with modern features and unmatched service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-6 hover:rotate-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-xl group animate-slide-in-left">
              <CardHeader>
                <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 animate-float">
                  <ShoppingBag className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="dark:text-white text-xl">Product Catalog</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Advanced product management with detailed descriptions and high-quality images
                </p>
                <div className="flex justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-500 animate-bounce" />
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-6 hover:-rotate-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-xl group animate-slide-in-up delay-200">
              <CardHeader>
                <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 animate-float delay-300">
                  <CreditCard className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="dark:text-white text-xl">Secure Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Stripe integration for safe and secure payment processing
                </p>
                <div className="flex justify-center">
                  <Shield className="h-6 w-6 text-green-500 animate-pulse" />
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-6 hover:rotate-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-xl group animate-slide-in-down delay-400">
              <CardHeader>
                <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 animate-float delay-600">
                  <Truck className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="dark:text-white text-xl">Fast Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Live inventory tracking and lightning-fast order delivery
                </p>
                <div className="flex justify-center">
                  <Zap className="h-6 w-6 text-purple-500 animate-bounce" />
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-6 hover:-rotate-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-xl group animate-slide-in-right delay-600">
              <CardHeader>
                <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 animate-float delay-900">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="dark:text-white text-xl">Customer Care</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  24/7 customer support with comprehensive analytics dashboard
                </p>
                <div className="flex justify-center">
                  <Heart className="h-6 w-6 text-red-500 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 dark:from-gray-800 dark:via-blue-800 dark:to-purple-800"></div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="mb-10 animate-bounce-in">
            <Gift className="h-16 w-16 text-yellow-400 mx-auto mb-6 animate-spin-slow" />
          </div>

          <h2 className="text-5xl font-bold mb-6 text-white animate-fade-in-up">Ready to Get Started?</h2>
          <p className="text-xl mb-12 text-gray-300 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Join thousands of satisfied customers and experience the future of online shopping with exclusive deals and
            premium service
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16 animate-fade-in-up delay-400">
            <Link href="/register">
              <Button
                size="lg"
                className="group px-12 py-6 bg-white text-gray-900 hover:bg-gray-100 shadow-3xl hover:shadow-4xl transform hover:scale-110 transition-all duration-500 animate-pulse-glow"
              >
                <Users className="h-6 w-6 mr-3 group-hover:animate-bounce" />
                Start Shopping Now
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
            <Link href="/products">
              <Button
                size="lg"
                variant="outline"
                className="group px-12 py-6 border-2 border-white text-white hover:bg-white hover:text-gray-900 shadow-3xl hover:shadow-4xl transform hover:scale-110 transition-all duration-500"
              >
                <ShoppingBag className="h-6 w-6 mr-3 group-hover:animate-bounce" />
                Browse Products
                <Sparkles className="h-5 w-5 ml-2 group-hover:animate-spin transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Animated Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center animate-fade-in-up delay-600">
            <div className="animate-bounce-in delay-700">
              <div className="text-4xl font-bold text-white mb-2 animate-count-up">50K+</div>
              <div className="text-gray-300 text-sm">Products</div>
            </div>
            <div className="animate-bounce-in delay-800">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-300 text-sm">Support</div>
            </div>
            <div className="animate-bounce-in delay-900">
              <div className="text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-gray-300 text-sm">Secure</div>
            </div>
            <div className="animate-bounce-in delay-1000">
              <div className="text-4xl font-bold text-white mb-2">Free</div>
              <div className="text-gray-300 text-sm">Shipping</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
