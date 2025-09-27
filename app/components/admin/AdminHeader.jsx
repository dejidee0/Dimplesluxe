// components/admin/AdminHeader.js
import { Bell } from "lucide-react";

const AdminHeader = ({
  activeTab,
  showNotifications,
  setShowNotifications,
}) => {
  const getTabDescription = (tab) => {
    switch (tab) {
      case "dashboard":
        return "Welcome back! Here's what's happening with your store.";
      case "orders":
        return "Manage and track your customer orders";
      case "products":
        return "Manage your hair product inventory";
      case "customers":
        return "View and manage your customer relationships";
      default:
        return "";
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">
            {activeTab}
          </h1>
          <p className="text-gray-600">{getTabDescription(activeTab)}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"></span>
          </button>
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-medium">A</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
