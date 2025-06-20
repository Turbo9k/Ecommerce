"use client"

export function FloatingShapes() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating Circles */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-float delay-2000"></div>

      {/* Floating Geometric Shapes */}
      <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rotate-45 animate-spin-slow"></div>
      <div className="absolute bottom-20 left-20 w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full animate-bounce-slow"></div>
      <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 rotate-12 animate-pulse"></div>

      {/* Animated Lines */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent animate-slide-down"></div>
      <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent animate-slide-down delay-1000"></div>
    </div>
  )
}
