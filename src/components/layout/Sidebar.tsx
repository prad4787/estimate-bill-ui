import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X, Home, Users, FileText, CreditCard, Receipt, Settings, TrendingUp, Building2, BarChart3, Package } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  const location = useLocation();
  
  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);
  
  return (
    <>
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm z-30"
          onClick={closeSidebar}
        />
      )}
      
      <aside 
        className={`
          fixed md:sticky md:top-16 inset-y-0 left-0 z-40
          w-72 bg-white border-r border-gray-200
          flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out
          md:h-[calc(100vh-4rem)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          shadow-xl md:shadow-none
        `}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-2 rounded-xl shadow-lg">
              <TrendingUp size={20} />
            </div>
            <h2 className="font-bold text-xl text-gray-900">BillManager</h2>
          </div>
          <button 
            onClick={closeSidebar}
            className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors duration-200"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="flex-1 py-6">
          <nav className="space-y-2">
            <NavLink 
              to="/" 
              className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
              end
            >
              <Home size={20} />
              <span>Dashboard</span>
            </NavLink>
            
            <NavLink 
              to="/clients" 
              className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Users size={20} />
              <span>Clients</span>
            </NavLink>
            
            <NavLink 
              to="/estimates" 
              className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <FileText size={20} />
              <span>Estimates</span>
            </NavLink>

            <NavLink 
              to="/stock" 
              className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Package size={20} />
              <span>Stock</span>
            </NavLink>

            <NavLink 
              to="/receipts" 
              className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Receipt size={20} />
              <span>Receipts</span>
            </NavLink>

            <NavLink 
              to="/payments" 
              className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <CreditCard size={20} />
              <span>Payment Methods</span>
            </NavLink>

            <NavLink 
              to="/reports/aging" 
              className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <BarChart3 size={20} />
              <span>Aging Report</span>
            </NavLink>
            <div className="px-3 py-2">
              <div className="border-t border-gray-200"></div>
            </div>

            <NavLink 
              to="/settings" 
              className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Building2 size={20} />
              <span>Organization</span>
            </NavLink>
            
            <NavLink 
              to="/settings/general" 
              className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Settings size={20} />
              <span>General Settings</span>
            </NavLink>
          </nav>
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Version 1.0.0</div>
            <div className="text-xs text-gray-400">© 2024 BillManager</div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;