// components/admin/AdminSidebar.js
import { motion } from "framer-motion";
import {
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../../lib/store";
import { useRouter } from "next/navigation";

const AdminSidebar = ({ activeTab, setActiveTab, tabs }) => {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const tabIcons = {
    dashboard: <BarChart3 className="w-5 h-5" />,
    orders: <ShoppingCart className="w-5 h-5" />,
    products: <Package className="w-5 h-5" />,
    customers: <Users className="w-5 h-5" />,
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="bg-white h-full border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center shadow-sm">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
            <p className="text-xs text-gray-500">Management Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {tabs.map((tab, index) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
              activeTab === tab.id
                ? "bg-slate-700 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              >
                {tabIcons[tab.id]}
              </div>
              <span className="font-medium text-sm">{tab.label}</span>
            </div>

            {activeTab === tab.id && (
              <>
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"
                />
                <ChevronRight className="w-4 h-4 text-white/70" />
              </>
            )}

            {activeTab !== tab.id && (
              <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            )}
          </motion.button>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.first_name || "Admin"} {user?.last_name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || "admin@dimplesluxe.com"}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium text-red-600"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
