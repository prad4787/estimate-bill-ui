import React from "react";
import { Menu, User, BarChart2, Bell, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="md:hidden rounded-xl p-2.5 text-gray-700 focus:outline-none"
          >
            <Menu size={20} />
          </button>
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-2 rounded-xl shadow-lg">
              <BarChart2 size={20} />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">
              BillManager
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2.5 text-gray-500 rounded-xl">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-200 relative group">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden shadow-md">
                <User size={18} className="text-white" />
              </div>
              <div className="hidden md:block">
                <span className="text-sm font-semibold text-gray-900">
                  {user?.name || "Admin User"}
                </span>
                <p className="text-xs text-gray-500">
                  {user?.role || "Administrator"}
                </p>
              </div>
            </div>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50">
              <div className="p-3 border-b border-gray-100">
                <div className="text-sm font-semibold text-gray-900">
                  {user?.name || "Admin User"}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.email || "demo@elbilling.com"}
                </div>
              </div>
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 rounded-lg"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
