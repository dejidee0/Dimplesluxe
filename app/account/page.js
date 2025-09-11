"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  Eye,
  Calendar,
  CreditCard,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore, useWishlistStore } from "../../lib/store";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../lib/currency";
import toast from "react-hot-toast";

export default function AccountPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const {
    wishlist,
    setWishlist,
    removeFromWishlist: removeFromWishlistStore,
    addToWishlist,
  } = useWishlistStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    fetchUserData();
  }, [user, router]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch wishlist
      const { data: wishlistData } = await supabase
        .from("wishlists")
        .select(
          `
          *,
          product:products(*)
        `
        )
        .eq("user_id", user.id);

      setOrders(ordersData || []);
      // Convert wishlistData to product objects for the store
      if (wishlistData) {
        const wishlistProducts = wishlistData
          .map((item) => ({
            ...item.product,
            id: item.product_id || item.product?.id,
          }))
          .filter(Boolean);
        setWishlist(wishlistProducts);
      } else {
        setWishlist([]);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      logout();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
      removeFromWishlistStore(productId);
      toast.success("Removed from wishlist");
    } catch (error) {
      toast.error("Error removing from wishlist");
    }
  };

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <User className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
    {
      id: "orders",
      label: "Orders",
      icon: <Package className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
    {
      id: "wishlist",
      label: "Wishlist",
      icon: <Heart className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            My Account
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Welcome back, {user.user_metadata?.first_name || user.email}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {user.user_metadata?.first_name || "User"}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    {user.email}
                  </p>
                </div>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-left text-sm sm:text-base ${
                      activeTab === tab.id
                        ? "bg-primary-50 text-primary-600 border border-primary-200"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left text-sm sm:text-base"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <>
                  {/* Overview Tab */}
                  {activeTab === "overview" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8">
                        Account Overview
                      </h2>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                        <div className="bg-gradient-to-r from-primary-500 to-rose-500 text-white p-4 sm:p-6 rounded-xl">
                          <Package className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3" />
                          <div className="text-2xl sm:text-3xl font-bold">
                            {orders.length}
                          </div>
                          <div className="text-sm sm:text-base opacity-90">
                            Total Orders
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 sm:p-6 rounded-xl">
                          <Heart className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3" />
                          <div className="text-2xl sm:text-3xl font-bold">
                            {wishlist.length}
                          </div>
                          <div className="text-sm sm:text-base opacity-90">
                            Wishlist Items
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4 sm:p-6 rounded-xl">
                          <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3" />
                          <div className="text-2xl sm:text-3xl font-bold">
                            £
                            {orders
                              .reduce(
                                (sum, order) =>
                                  sum + parseFloat(order.total || 0),
                                0
                              )
                              .toFixed(2)}
                          </div>
                          <div className="text-sm sm:text-base opacity-90">
                            Total Spent
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                        {/* Recent Orders */}
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                            Recent Orders
                          </h3>
                          <div className="space-y-3 sm:space-y-4">
                            {orders.slice(0, 3).map((order) => (
                              <div
                                key={order.id}
                                className="border border-gray-200 rounded-lg p-3 sm:p-4"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="text-sm sm:text-base font-medium text-gray-900">
                                    #{order.order_number}
                                  </div>
                                  <div
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      order.status === "delivered"
                                        ? "bg-green-100 text-green-800"
                                        : order.status === "shipped"
                                        ? "bg-blue-100 text-blue-800"
                                        : order.status === "processing"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {order.status}
                                  </div>
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600 mb-1">
                                  {new Date(
                                    order.created_at
                                  ).toLocaleDateString()}
                                </div>
                                <div className="text-sm sm:text-base font-semibold text-gray-900">
                                  {formatPrice(order.total, order.currency)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recent Wishlist */}
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                            Wishlist Preview
                          </h3>
                          <div className="space-y-3 sm:space-y-4">
                            {wishlist.slice(0, 3).map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center space-x-3 sm:space-x-4 border border-gray-200 rounded-lg p-3 sm:p-4"
                              >
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm sm:text-base font-medium text-gray-900 truncate">
                                    {item.name || "Product"}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-600">
                                    {formatPrice(item.price || 0)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Orders Tab */}
                  {activeTab === "orders" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8">
                        Order History
                      </h2>

                      {orders.length === 0 ? (
                        <div className="text-center py-8 sm:py-12">
                          <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                            No orders yet
                          </h3>
                          <p className="text-gray-600 mb-6 text-sm sm:text-base">
                            Start shopping to see your orders here
                          </p>
                          <button
                            onClick={() => router.push("/products")}
                            className="btn-primary text-sm sm:text-base"
                          >
                            Browse Products
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4 sm:space-y-6">
                          {orders.map((order) => (
                            <div
                              key={order.id}
                              className="border border-gray-200 rounded-xl p-4 sm:p-6"
                            >
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                                <div>
                                  <div className="text-base sm:text-lg font-semibold text-gray-900">
                                    Order #{order.order_number}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-600 flex items-center space-x-4">
                                    <span className="flex items-center">
                                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                      {new Date(
                                        order.created_at
                                      ).toLocaleDateString()}
                                    </span>
                                    <span>
                                      {formatPrice(order.total, order.currency)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                                      order.status === "delivered"
                                        ? "bg-green-100 text-green-800"
                                        : order.status === "shipped"
                                        ? "bg-blue-100 text-blue-800"
                                        : order.status === "processing"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {order.status}
                                  </div>
                                  <button className="text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-medium">
                                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                                    View Details
                                  </button>
                                </div>
                              </div>

                              <div className="text-xs sm:text-sm text-gray-600">
                                <p>
                                  Delivery to: {order.shipping_city},{" "}
                                  {order.shipping_postcode}
                                </p>
                                {order.tracking_number && (
                                  <p>Tracking: {order.tracking_number}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Wishlist Tab */}
                  {activeTab === "wishlist" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8">
                        My Wishlist
                      </h2>

                      {wishlist.length === 0 ? (
                        <div className="text-center py-8 sm:py-12">
                          <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                            Your wishlist is empty
                          </h3>
                          <p className="text-gray-600 mb-6 text-sm sm:text-base">
                            Save items you love for later
                          </p>
                          <button
                            onClick={() => router.push("/products")}
                            className="btn-primary text-sm sm:text-base"
                          >
                            Browse Products
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                          {wishlist.map((item) => (
                            <div
                              key={item.id}
                              className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                            >
                              <div className="h-32 sm:h-48 bg-gray-200"></div>
                              <div className="p-3 sm:p-4">
                                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base truncate">
                                  {item.name || "Product"}
                                </h3>
                                <div className="text-sm sm:text-base font-bold text-primary-600 mb-3">
                                  {formatPrice(item.price || 0)}
                                </div>
                                <div className="flex space-x-2">
                                  <button className="flex-1 bg-primary-500 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-primary-600 transition-colors">
                                    Add to Cart
                                  </button>
                                  <button
                                    onClick={() => removeFromWishlist(item.id)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Settings Tab */}
                  {activeTab === "settings" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8">
                        Account Settings
                      </h2>

                      <div className="space-y-6 sm:space-y-8">
                        {/* Profile Information */}
                        <div className="border border-gray-200 rounded-xl p-4 sm:p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Profile Information
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name
                              </label>
                              <input
                                type="text"
                                defaultValue={
                                  user.user_metadata?.first_name || ""
                                }
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name
                              </label>
                              <input
                                type="text"
                                defaultValue={
                                  user.user_metadata?.last_name || ""
                                }
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                              </label>
                              <input
                                type="email"
                                defaultValue={user.email}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                                disabled
                              />
                            </div>
                          </div>
                          <button className="mt-4 btn-primary text-sm sm:text-base">
                            Update Profile
                          </button>
                        </div>

                        {/* Password Change */}
                        <div className="border border-gray-200 rounded-xl p-4 sm:p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Change Password
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                              </label>
                              <input
                                type="password"
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                              </label>
                              <input
                                type="password"
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                              </label>
                              <input
                                type="password"
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                              />
                            </div>
                          </div>
                          <button className="mt-4 btn-primary text-sm sm:text-base">
                            Update Password
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
