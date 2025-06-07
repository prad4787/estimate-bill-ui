import React from 'react';
import { Menu, User, BarChart2, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar} 
            className="md:hidden rounded-xl p-2.5 text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors duration-200"
          >
            <Menu size={20} />
          </button>
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-2 rounded-xl shadow-lg">
              <BarChart2 size={20} />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">BillManager</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden shadow-md">
              <User size={18} className="text-white" />
            </div>
            <div className="hidden md:block">
              <span className="text-sm font-semibold text-gray-900">Admin User</span>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;