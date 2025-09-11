"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../../lib/store";
import { formatPrice } from "../../lib/currency";
import toast from "react-hot-toast";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getTotal,
    getItemCount,
    currency,
    exchangeRate,
  } = useCartStore();

  const [isLoading, setIsLoading] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId);
      toast.success("Item removed from cart");
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId, productName) => {
    removeItem(productId);
    toast.success(`${productName} removed from cart`);
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Cart cleared");
  };

  const handleCheckout = () => {
    setIsLoading(true);
    router.push("/checkout");
  };

  const subtotal = getTotal();
  const shipping = subtotal > 50 ? 0 : 4.99;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
                <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
              </div>

              <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Your Cart is Empty
              </h1>

              <p className="text-gray-600 text-base sm:text-lg mb-8">
                Looks like you haven't added any premium hair products to your
                cart yet. Discover our luxury collection and find your perfect
                match.
              </p>

              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/products" className="btn-primary">
                  Browse Products
                </Link>
                <Link href="/" className="btn-secondary">
                  Back to Home
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            {getItemCount()} {getItemCount() === 1 ? "item" : "items"} in your
            cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-lg sm:text-xl text-gray-900">
                  Cart Items
                </h2>
                <button
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Clear Cart
                </button>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-200">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 sm:p-6"
                    >
                      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        {/* Product Image */}
                        <div className="w-full sm:w-24 h-48 sm:h-24 relative rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={
                              item.images?.[0] ||
                              "https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=800"
                            }
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1">
                                {item.name}
                              </h3>
                              <div className="text-sm text-gray-600 space-y-1">
                                {item.selectedLength && (
                                  <p>Length: {item.selectedLength}"</p>
                                )}
                                {item.selectedColor && (
                                  <p>Color: {item.selectedColor}</p>
                                )}
                              </div>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() =>
                                handleRemoveItem(item.id, item.name)
                              }
                              className="text-gray-400 hover:text-red-500 transition-colors mt-2 sm:mt-0 self-end sm:self-start"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Quantity and Price */}
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-600">
                                Qty:
                              </span>
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      item.quantity - 1
                                    )
                                  }
                                  className="p-2 hover:bg-gray-50 transition-colors"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-3 py-2 font-medium min-w-[3rem] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }
                                  className="p-2 hover:bg-gray-50 transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <div className="font-semibold text-lg text-gray-900">
                                {formatPrice(
                                  item.price * item.quantity,
                                  currency,
                                  exchangeRate
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatPrice(
                                  item.price,
                                  currency,
                                  exchangeRate
                                )}{" "}
                                each
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 sticky top-32">
              <h2 className="font-semibold text-lg sm:text-xl text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({getItemCount()} items)</span>
                  <span>{formatPrice(subtotal, currency, exchangeRate)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      formatPrice(shipping, currency, exchangeRate)
                    )}
                  </span>
                </div>

                {subtotal < 50 && (
                  <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                    Add {formatPrice(50 - subtotal, currency, exchangeRate)}{" "}
                    more for free shipping!
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between font-semibold text-lg sm:text-xl text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(total, currency, exchangeRate)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mb-4"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}

                <span>
                  {isLoading ? "Processing..." : "Proceed to Checkout"}
                </span>
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>

              <Link
                href="/products"
                className="w-full btn-secondary text-center block"
              >
                Continue Shopping
              </Link>

              {/* Security Features */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <span>30-day return policy</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <span>Premium quality guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
