"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Eye, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore, useWishlistStore, useAuthStore } from "../../lib/store";
import { formatPrice } from "../../lib/currency";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

export default function ProductCard({ product }) {
  const { addItem, currency, exchangeRate } = useCartStore();
  const { user } = useAuthStore();
  const {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isWishlisted,
    setWishlist,
  } = useWishlistStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Optionally, fetch wishlist from Supabase on mount if user is logged in
    // and setWishlist if not already loaded
    // This is best handled globally on login, but can be here for SSR/CSR sync
  }, [user]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success("Added to cart!");
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please sign in to use wishlist");
      return;
    }
    setLoading(true);
    try {
      if (isWishlisted(product.id)) {
        // Remove from wishlist in Supabase
        await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", product.id);
        removeFromWishlist(product.id);
        toast.success("Removed from wishlist");
      } else {
        // Add to wishlist in Supabase
        await supabase.from("wishlists").insert({
          user_id: user.id,
          product_id: product.id,
        });
        addToWishlist(product);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      toast.error("Wishlist error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-hover overflow-hidden w-full"
    >
      <Link href={`/product/${product.id}`}>
        {/* Image Container */}
        <div className="relative h-48 sm:h-64 md:h-72 lg:h-80 overflow-hidden">
          <Image
            src={
              product.images?.[0] ||
              "https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=800"
            }
            alt={product.name}
            priority={product.is_featured}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <div className="flex space-x-2 sm:space-x-3">
              <button
                onClick={handleAddToCart}
                className="bg-white/90 hover:bg-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
              </button>
              <button
                onClick={handleToggleWishlist}
                disabled={loading}
                className={`p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                  isWishlisted(product.id)
                    ? "bg-primary-500 text-white"
                    : "bg-white/90 hover:bg-white text-gray-800"
                }`}
              >
                <Heart
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    isWishlisted(product.id) ? "fill-current" : ""
                  }`}
                />
              </button>
              <div className="bg-white/90 hover:bg-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
              </div>
            </div>
          </div>

          {/* Sale Badge */}
          {product.sale && (
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              Sale
            </div>
          )}

          {/* New Badge */}
          {product.isNew && (
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              New
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Rating */}
          <div className="flex items-center space-x-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                  i < (product.rating || 5)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-xs sm:text-sm text-gray-600 ml-2">
              ({product.reviews || 0} reviews)
            </span>
          </div>

          {/* Name */}
          <h3 className="font-semibold text-sm sm:text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Length Options */}
          {product.lengths && (
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
              {product.lengths.slice(0, 3).map((length) => (
                <span
                  key={length}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {length}"
                </span>
              ))}
              {product.lengths.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{product.lengths.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg sm:text-2xl font-bold text-gray-900">
                {formatPrice(product.price, currency, exchangeRate)}
              </span>
              {product.originalPrice && (
                <span className="text-sm sm:text-lg text-gray-500 line-through">
                  {formatPrice(product.originalPrice, currency, exchangeRate)}
                </span>
              )}
            </div>
            {/* Stock Status */}
            <div
              className={`text-xs px-2 py-1 rounded-full ${
                product.stock > 10
                  ? "bg-green-100 text-green-800"
                  : product.stock > 0
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {product.stock > 10
                ? "In Stock"
                : product.stock > 0
                ? "Low Stock"
                : "Out of Stock"}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
