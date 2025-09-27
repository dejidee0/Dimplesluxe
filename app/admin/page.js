"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Bell, X, Camera } from "lucide-react";

// Components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import DashboardOverview from "../components/admin/DashboardOveriew";
import OrdersManagement from "../components/admin/OrdersManagement";
import ProductsManagement from "../components/admin/ProductsManagement";
import CustomersManagement from "../components/admin/CustomersManagement";
import NotificationsDropdown from "../components/admin/NotificationsDropdown";

// Hooks & Utils
import { useAuthStore } from "../../lib/store";
import { useAdminData } from "../../hooks/useAdminData";
import { supabase } from "../../lib/supabase";

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [categories, setCategories] = useState([]);

  // Custom hook for admin data management
  const {
    loading,
    stats,
    orders,
    products,
    customers,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    filteredOrders,
    fetchDashboardData,
  } = useAdminData();

  useEffect(() => {
    fetchDashboardData();
    fetchCategories();
  }, []);

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "orders", label: "Orders" },
    { id: "products", label: "Products" },
    { id: "customers", label: "Customers" },
  ];

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const handleAddProduct = async (product) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert([product])
        .select();

      if (error) throw error;
      fetchDashboardData();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleUpdateProduct = async (product) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .update(product)
        .eq("id", product.id)
        .select();

      if (error) throw error;
      fetchDashboardData();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;
      fetchDashboardData();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardOverview
            loading={loading}
            stats={stats}
            orders={orders}
            products={products}
          />
        );
      case "orders":
        return (
          <OrdersManagement
            loading={loading}
            orders={filteredOrders}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
          />
        );
      case "products":
        return (
          <ProductsManagement
            loading={loading}
            products={products}
            categories={categories}
            supabase={supabase}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateProduct={handleUpdateProduct}
            onFetchCategories={fetchCategories}
          />
        );
      case "customers":
        return (
          <CustomersManagement
            loading={loading}
            customers={customers}
            stats={stats}
          />
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-bold text-lg text-gray-900">Dimplesluxe</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 relative"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-screen pt-16 lg:pt-0">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <AdminSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabs={tabs}
          />
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50"
              >
                <AdminSidebar
                  activeTab={activeTab}
                  setActiveTab={(tab) => {
                    setActiveTab(tab);
                    setSidebarOpen(false);
                  }}
                  tabs={tabs}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop Header */}
          <div className="hidden lg:block">
            <AdminHeader
              activeTab={activeTab}
              showNotifications={showNotifications}
              setShowNotifications={setShowNotifications}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4 lg:p-8">
            {renderActiveContent()}
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      <NotificationsDropdown
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        orders={orders}
      />

      <Footer />
    </div>
  );
}
