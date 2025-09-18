"use client";
import Link from "next/link";
import { ArrowRight, Star, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-rose-50 to-pink-50 md:px-10">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary-200 rounded-full opacity-20 animate-bounce-gentle"></div>
        <div
          className="absolute top-40 right-20 w-16 h-16 bg-rose-200 rounded-full opacity-30 animate-bounce-gentle"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 left-20 w-12 h-12 bg-pink-200 rounded-full opacity-25 animate-bounce-gentle"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 right-10 w-24 h-24 bg-primary-100 rounded-full opacity-20 animate-bounce-gentle"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">
                Premium Human Hair Collection
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-playfair text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Luxury Hair, <span className="gradient-text">Redefined</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              Discover our premium collection of 100% virgin human hair bundles,
              extensions, and luxury hair products. Quality guaranteed, beauty
              delivered.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-8 mb-8"
            >
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <span className="text-sm sm:text-base text-gray-600">
                  5.0 (500+ reviews)
                </span>
              </div>
              <div className="text-sm sm:text-base text-gray-600">
                <span className="font-semibold text-primary-600">2,000+</span>{" "}
                Happy Customers
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <Link
                href="/products"
                className="btn-primary group flex items-center justify-center space-x-2 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
              >
                <span>Shop Collection</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/about"
                className="btn-secondary flex items-center justify-center space-x-2 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
              >
                <span>Our Story</span>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-600"
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span>Free UK Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span>30-Day Returns</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span>Premium Quality</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary-100 to-rose-100">
                <img
                  src="https://images.unsplash.com/photo-1656473031961-9d5d9ee19f40?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmxhY2slMjB3b21hbiUyMHBvcnRyYWl0fGVufDB8fDB8fHww"
                  alt="Premium Human Hair"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Elements */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-luxury p-4 sm:p-6"
              >
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary-600">
                    100%
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Virgin Hair
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-luxury p-4 sm:p-6"
              >
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-rose-600">
                    5★
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Rated</div>
                </div>
              </motion.div>
            </div>

            {/* Background Decoration */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-8 left-8 w-full h-full rounded-3xl bg-gradient-to-br from-primary-200 to-rose-200 opacity-20"></div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden lg:block"
      >
        <div className="flex flex-col items-center space-y-2 text-gray-400">
          <span className="text-sm">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-300 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
