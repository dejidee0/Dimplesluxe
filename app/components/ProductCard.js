"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ShoppingBag,
  Eye,
  Star,
  ImageIcon,
  Play,
  Video,
} from "lucide-react";
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

  // Get primary media - PRIORITIZE IMAGES, only show videos if NO images exist
  const getPrimaryMedia = () => {
    // product.images contains all media from product_images table
    const allMedia = product.images || [];

    if (allMedia.length > 0) {
      // Separate images and videos
      const images = allMedia.filter((m) => !m.is_video);
      const videos = allMedia.filter((m) => m.is_video);

      console.log("Product media:", {
        name: product.name,
        total: allMedia.length,
        images: images.length,
        videos: videos.length,
        allMedia: allMedia.map((m) => ({
          url: m.image_url,
          isVideo: m.is_video,
          isPrimary: m.is_primary,
        })),
      });

      // PRIORITY 1: If there are images, use them (ignore videos)
      if (images.length > 0) {
        // Find primary image
        const primaryImage = images.find((img) => img.is_primary);
        if (primaryImage) {
          console.log("Using primary image:", primaryImage.image_url);
          return {
            url: primaryImage.image_url,
            isVideo: false,
            alt: primaryImage.alt_text || product.name,
          };
        }
        // Use first image if no primary
        console.log("Using first image:", images[0].image_url);
        return {
          url: images[0].image_url,
          isVideo: false,
          alt: images[0].alt_text || product.name,
        };
      }

      // PRIORITY 2: Only if NO images exist, use video
      if (videos.length > 0) {
        const primaryVideo = videos.find((vid) => vid.is_primary);
        if (primaryVideo) {
          console.log(
            "Using primary video (no images available):",
            primaryVideo.image_url
          );
          return {
            url: primaryVideo.image_url,
            isVideo: true,
            alt: primaryVideo.alt_text || product.name,
          };
        }
        console.log(
          "Using first video (no images available):",
          videos[0].image_url
        );
        return {
          url: videos[0].image_url,
          isVideo: true,
          alt: videos[0].alt_text || product.name,
        };
      }
    }

    // Fallback to legacy image_url field
    if (product.image_url) {
      console.log("Using legacy image_url:", product.image_url);
      return {
        url: product.image_url,
        isVideo: false,
        alt: product.name,
      };
    }

    // Final fallback to placeholder
    console.log("Using placeholder image");
    return {
      url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D",
      isVideo: false,
      alt: product.name,
    };
  };

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

  const primaryMedia = getPrimaryMedia();
  const allMedia = product.images || [];
  const totalMediaCount = allMedia.length;
  const imageCount = allMedia.filter((m) => !m.is_video).length;
  const videoCount = allMedia.filter((m) => m.is_video).length;
  const hasOnlyVideos = videoCount > 0 && imageCount === 0;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-hover overflow-hidden w-full"
    >
      <Link href={`/product/${product.id}`}>
        {/* Image/Video Container */}
        <div className="relative h-48 sm:h-64 md:h-72 lg:h-80 overflow-hidden bg-gray-100">
          {primaryMedia.isVideo ? (
            <div className="relative w-full h-full">
              <video
                src={primaryMedia.url}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                muted
                loop
                playsInline
                onError={(e) => {
                  console.error("Failed to load video:", primaryMedia.url);
                }}
              />
              {/* Video Play Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 text-white fill-white" />
                </div>
              </div>
            </div>
          ) : (
            <Image
              src={primaryMedia.url}
              alt={primaryMedia.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              priority={product.is_featured}
              onError={(e) => {
                console.error("Failed to load image:", primaryMedia.url);
              }}
            />
          )}

          {/* Media Count Badge - Shows total media with video indicator if mixed */}
          {totalMediaCount > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1.5">
              <ImageIcon className="w-3 h-3" />
              <span>{totalMediaCount}</span>
              {videoCount > 0 && !hasOnlyVideos && (
                <>
                  <span className="text-pink-300">•</span>
                  <Video className="w-3 h-3 text-pink-300" />
                  <span className="text-pink-300">{videoCount}</span>
                </>
              )}
            </div>
          )}

          {/* Video-Only Badge */}
          {hasOnlyVideos && (
            <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <Video className="w-3 h-3" />
              <span>Video Product</span>
            </div>
          )}

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <div className="flex space-x-2 sm:space-x-3">
              <button
                onClick={handleAddToCart}
                className="bg-white/90 hover:bg-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110"
                aria-label="Add to cart"
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
                aria-label={
                  isWishlisted(product.id)
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                <Heart
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    isWishlisted(product.id) ? "fill-current" : ""
                  }`}
                />
              </button>
              <div
                className="bg-white/90 hover:bg-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110"
                aria-label="Quick view"
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
              </div>
            </div>
          </div>

          {/* Sale Badge */}
          {product.is_sale && (
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              Sale
            </div>
          )}

          {/* New Badge */}
          {product.is_new && !product.is_sale && (
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
              ({product.review_count || 0} reviews)
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
          {product.lengths && product.lengths.length > 0 && (
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
              {product.original_price &&
                product.original_price > product.price && (
                  <span className="text-sm sm:text-lg text-gray-500 line-through">
                    {formatPrice(
                      product.original_price,
                      currency,
                      exchangeRate
                    )}
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
