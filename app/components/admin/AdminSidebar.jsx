// components/admin/AdminSidebar.js
import { motion } from "framer-motion";
import {
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  Settings,
} from "lucide-react";

const AdminSidebar = ({ activeTab, setActiveTab, tabs }) => {
  const tabIcons = {
    dashboard: <BarChart3 className="w-5 h-5" />,
    orders: <ShoppingCart className="w-5 h-5" />,
    products: <Package className="w-5 h-5" />,
    customers: <Users className="w-5 h-5" />,
  };

  return (
    <div className="bg-white h-full shadow-xl border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900">Dimplesluxe</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-pink-50 to-rose-50 text-pink-600 shadow-sm border border-pink-100"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <div
              className={`${
                activeTab === tab.id
                  ? "text-pink-600"
                  : "text-gray-400 group-hover:text-gray-600"
              }`}
            >
              {tabIcons[tab.id]}
            </div>
            <span className="font-medium">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="ml-auto w-2 h-2 bg-pink-500 rounded-full"
              />
            )}
          </button>
        ))}
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-medium">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">admin@dimplesluxe.com</p>
          </div>
          <Settings className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
