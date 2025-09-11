"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import {
  Heart,
  ShoppingBag,
  Star,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Check,
  Truck,
  Shield,
  RotateCcw,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../lib/supabase";
import {
  useCartStore,
  useAuthStore,
  useWishlistStore,
} from "../../../lib/store";
import { formatPrice } from "../../../lib/currency";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { addItem, currency, exchangeRate } = useCartStore();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedLength, setSelectedLength] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { isWishlisted, addToWishlist, removeFromWishlist } =
    useWishlistStore();
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    if (params.id) {
      fetchProduct();
      fetchRelatedProducts();
      fetchReviews();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const { data: product, error } = await supabase
        .from("products")
        .select(
          `
          *,
          category:categories!products_category_id_fkey(name, slug),
          product_images(image_url, alt_text, is_primary, sort_order)
        `
        )
        .eq("id", params.id)
        .eq("is_active", true)
        .single();

      if (error) throw error;

      // Sort images by sort_order
      if (product.product_images) {
        product.product_images.sort((a, b) => a.sort_order - b.sort_order);
      }

      setProduct(product);

      // Set default selections
      if (product.lengths && product.lengths.length > 0) {
        setSelectedLength(product.lengths[0]);
      }
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      router.push("/404");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const { data } = await supabase
        .from("products")
        .select(
          `
          *,
          category:categories!products_category_id_fkey(name, slug),
          product_images(image_url, alt_text, is_primary)
        `
        )
        .eq("is_active", true)
        .neq("id", params.id)
        .limit(4);

      setRelatedProducts(data || []);
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", params.id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(5);

      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleAddToCart = () => {
    if (!selectedLength && product.lengths?.length > 0) {
      toast.error("Please select a length");
      return;
    }
    if (!selectedColor && product.colors?.length > 0) {
      toast.error("Please select a color");
      return;
    }

    const cartItem = {
      ...product,
      selectedLength,
      selectedColor,
      quantity,
    };

    for (let i = 0; i < quantity; i++) {
      addItem(cartItem);
    }

    toast.success(`Added ${quantity} item(s) to cart!`);
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.error("Please sign in to add to wishlist");
      router.push("/auth/login");
      return;
    }
    setWishlistLoading(true);
    try {
      if (isWishlisted(product?.id)) {
        await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", product.id);
        removeFromWishlist(product.id);
        toast.success("Removed from wishlist");
      } else {
        await supabase.from("wishlists").insert({
          user_id: user.id,
          product_id: product.id,
        });
        addToWishlist(product);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error("Something went wrong");
    } finally {
      setWishlistLoading(false);
    }
  };

  const nextImage = () => {
    if (product?.product_images) {
      setCurrentImageIndex((prev) =>
        prev === product.product_images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product?.product_images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.product_images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <div className="h-96 lg:h-[600px] bg-gray-200 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The product you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.push("/products")}
            className="btn-primary"
          >
            Browse Products
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => router.push("/")}
              className="hover:text-primary-600"
            >
              Home
            </button>
            <span>/</span>
            <button
              onClick={() => router.push("/products")}
              className="hover:text-primary-600"
            >
              Products
            </button>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12 lg:mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative h-96 sm:h-[500px] lg:h-[600px] bg-gray-100 rounded-2xl overflow-hidden group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={
                      product.product_images?.[currentImageIndex]?.image_url ||
                      "https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=800"
                    }
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              {product.product_images && product.product_images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image Indicators */}
              {product.product_images && product.product_images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {product.product_images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.product_images && product.product_images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {product.product_images.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative h-20 sm:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-primary-500"
                        : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image.image_url}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < (product.rating || 5)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                ({product.review_count || 0} reviews)
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600 text-lg">
                {product.short_description}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                {formatPrice(product.price, currency, exchangeRate)}
              </span>
              {product.original_price && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.original_price, currency, exchangeRate)}
                </span>
              )}
              {product.is_sale && (
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  Sale
                </span>
              )}
            </div>

            {/* Length Selection */}
            {product.lengths && product.lengths.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Length</h3>
                <div className="flex flex-wrap gap-2">
                  {product.lengths.map((length) => (
                    <button
                      key={length}
                      onClick={() => setSelectedLength(length)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedLength === length
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {length}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedColor === color
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="p-2 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-gray-600">{product.stock} available</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className={`btn-secondary flex items-center justify-center space-x-2 ${
                  isWishlisted(product?.id)
                    ? "bg-primary-50 text-primary-700 border-primary-200"
                    : ""
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isWishlisted(product?.id) ? "fill-current" : ""
                  }`}
                />
                <span>
                  {isWishlisted(product?.id) ? "Wishlisted" : "Add to Wishlist"}
                </span>
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-primary-600" />
                <span className="text-sm text-gray-700">
                  Free UK delivery over £50
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-primary-600" />
                <span className="text-sm text-gray-700">
                  100% Virgin Human Hair
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-5 h-5 text-primary-600" />
                <span className="text-sm text-gray-700">
                  30-day return policy
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-primary-600" />
                <span className="text-sm text-gray-700">
                  Premium quality guarantee
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-12 lg:mb-16">
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {[
                { id: "description", label: "Description" },
                { id: "specifications", label: "Specifications" },
                { id: "care", label: "Care Instructions" },
                { id: "reviews", label: `Reviews (${reviews.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="prose max-w-none">
            {activeTab === "description" && (
              <div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {product.description}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>100% Virgin Human Hair</li>
                  <li>Can be dyed, bleached, and styled</li>
                  <li>Natural shine and movement</li>
                  <li>Ethically sourced</li>
                  <li>Long-lasting with proper care</li>
                </ul>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Product Details
                  </h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Origin:</dt>
                      <dd className="font-medium">
                        {product.origin_country || "Brazil"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Weight:</dt>
                      <dd className="font-medium">
                        {product.weight || "100g"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Texture:</dt>
                      <dd className="font-medium">
                        {product.textures?.[0] || "Natural"}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Available Options
                  </h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-gray-600 mb-1">Lengths:</dt>
                      <dd className="font-medium">
                        {product.lengths?.join('", ') + '"' || "Various"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-600 mb-1">Colors:</dt>
                      <dd className="font-medium">
                        {product.colors?.join(", ") || "Natural Black"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {activeTab === "care" && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  How to Care for Your Hair
                </h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Washing</h5>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Use sulfate-free shampoo</li>
                      <li>Wash in lukewarm water</li>
                      <li>Gently massage, don't rub</li>
                      <li>Rinse thoroughly</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">
                      Conditioning
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Apply conditioner from mid-length to ends</li>
                      <li>Leave for 3-5 minutes</li>
                      <li>Use deep conditioner weekly</li>
                      <li>Rinse with cool water</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Styling</h5>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Use heat protectant before styling</li>
                      <li>Keep heat tools below 180°C</li>
                      <li>Air dry when possible</li>
                      <li>Store properly when not in use</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-gray-200 pb-6 last:border-b-0"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium text-gray-900">
                            {review.title}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{review.comment}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="font-medium text-gray-900 mb-2">
                      No reviews yet
                    </h4>
                    <p className="text-gray-600">
                      Be the first to review this product!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={{
                    ...relatedProduct,
                    images:
                      relatedProduct.product_images?.map(
                        (img) => img.image_url
                      ) || [],
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
