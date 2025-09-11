"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Download,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../lib/store";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../lib/currency";
import toast from "react-hot-toast";

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    // Check if user is admin
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // For demo purposes, we'll allow access. In production, check admin role
    fetchDashboardData();
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      // Fetch products
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      // Calculate stats
      const totalOrders = ordersData?.length || 0;
      const totalRevenue =
        ordersData?.reduce(
          (sum, order) => sum + parseFloat(order.total || 0),
          0
        ) || 0;
      const totalProducts = productsData?.length || 0;

      setOrders(ordersData || []);
      setProducts(productsData || []);
      setStats({
        totalOrders,
        totalRevenue,
        totalProducts,
        totalCustomers: 0, // Would need to query auth.users
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
    {
      id: "orders",
      label: "Orders",
      icon: <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
    {
      id: "products",
      label: "Products",
      icon: <Package className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
    {
      id: "customers",
      label: "Customers",
      icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />,
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
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your Dimplesluxe store
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
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
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <>
                  {/* Dashboard Tab */}
                  {activeTab === "dashboard" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">
                          Overview
                        </h2>
                        <button className="btn-primary text-sm sm:text-base">
                          <Download className="w-4 h-4 mr-2" />
                          Export Report
                        </button>
                      </div>

                      {/* Stats Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sm:p-6 rounded-xl">
                          <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3" />
                          <div className="text-2xl sm:text-3xl font-bold">
                            {stats.totalOrders}
                          </div>
                          <div className="text-sm sm:text-base opacity-90">
                            Total Orders
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 sm:p-6 rounded-xl">
                          <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3" />
                          <div className="text-2xl sm:text-3xl font-bold">
                            £{stats.totalRevenue.toFixed(2)}
                          </div>
                          <div className="text-sm sm:text-base opacity-90">
                            Total Revenue
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 sm:p-6 rounded-xl">
                          <Package className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3" />
                          <div className="text-2xl sm:text-3xl font-bold">
                            {stats.totalProducts}
                          </div>
                          <div className="text-sm sm:text-base opacity-90">
                            Products
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-4 sm:p-6 rounded-xl">
                          <Users className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3" />
                          <div className="text-2xl sm:text-3xl font-bold">
                            {stats.totalCustomers}
                          </div>
                          <div className="text-sm sm:text-base opacity-90">
                            Customers
                          </div>
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                            Recent Orders
                          </h3>
                          <div className="space-y-3 sm:space-y-4">
                            {orders.slice(0, 5).map((order) => (
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
                                  {order.customer_name}
                                </div>
                                <div className="text-sm sm:text-base font-semibold text-gray-900">
                                  {formatPrice(order.total, order.currency)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                            Top Products
                          </h3>
                          <div className="space-y-3 sm:space-y-4">
                            {products.slice(0, 5).map((product) => (
                              <div
                                key={product.id}
                                className="flex items-center space-x-3 sm:space-x-4 border border-gray-200 rounded-lg p-3 sm:p-4"
                              >
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm sm:text-base font-medium text-gray-900 truncate">
                                    {product.name}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-600">
                                    Stock: {product.stock || 0}
                                  </div>
                                  <div className="text-sm sm:text-base font-semibold text-primary-600">
                                    {formatPrice(product.price)}
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
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">
                          Orders Management
                        </h2>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search orders..."
                              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                            />
                          </div>
                          <button className="btn-secondary text-sm">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm sm:text-base">
                                Order
                              </th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm sm:text-base">
                                Customer
                              </th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm sm:text-base">
                                Status
                              </th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm sm:text-base">
                                Total
                              </th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm sm:text-base">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map((order) => (
                              <tr
                                key={order.id}
                                className="border-b border-gray-100 hover:bg-gray-50"
                              >
                                <td className="py-3 px-4">
                                  <div className="text-sm sm:text-base font-medium text-gray-900">
                                    #{order.order_number}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-600">
                                    {new Date(
                                      order.created_at
                                    ).toLocaleDateString()}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="text-sm sm:text-base text-gray-900">
                                    {order.customer_name}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-600">
                                    {order.customer_email}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div
                                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
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
                                </td>
                                <td className="py-3 px-4 text-sm sm:text-base font-semibold text-gray-900">
                                  {formatPrice(order.total, order.currency)}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex space-x-2">
                                    <button className="text-blue-600 hover:text-blue-700">
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button className="text-green-600 hover:text-green-700">
                                      <Edit className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}

                  {/* Products Tab */}
                  {activeTab === "products" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">
                          Products Management
                        </h2>
                        <button className="btn-primary text-sm sm:text-base">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Product
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {products.map((product) => (
                          <div
                            key={product.id}
                            className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                          >
                            <div className="h-32 sm:h-48 bg-gray-200"></div>
                            <div className="p-3 sm:p-4">
                              <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base truncate">
                                {product.name}
                              </h3>
                              <div className="text-xs sm:text-sm text-gray-600 mb-2">
                                Stock: {product.stock || 0}
                              </div>
                              <div className="text-sm sm:text-base font-bold text-primary-600 mb-3">
                                {formatPrice(product.price)}
                              </div>
                              <div className="flex space-x-2">
                                <button className="flex-1 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium">
                                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                                  View
                                </button>
                                <button className="flex-1 text-green-600 hover:text-green-700 text-xs sm:text-sm font-medium">
                                  <Edit className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                                  Edit
                                </button>
                                <button className="flex-1 text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium">
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Customers Tab */}
                  {activeTab === "customers" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8">
                        Customer Management
                      </h2>

                      <div className="text-center py-8 sm:py-12">
                        <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                          Customer Management
                        </h3>
                        <p className="text-gray-600 text-sm sm:text-base">
                          Customer management features will be available soon
                        </p>
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
