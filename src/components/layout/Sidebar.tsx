import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X, Home, Users, FileText, CreditCard, Receipt, Settings } from 'lucide-react';

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
          className="md:hidden fixed inset-0 bg-gray-900 bg-opacity-50 z-30"
          onClick={closeSidebar}
        />
      )}
      
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-gray-200
          flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between md:hidden">
          <h2 className="font-semibold text-lg">BillManager</h2>
          <button 
            onClick={closeSidebar}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="flex-1 py-4">
          <nav className="px-2 space-y-1">
            <NavLink 
              to="/" 
              className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
              end
            >
              <Home size={18} />
              <span>Dashboard</span>
            </NavLink>
            
            <NavLink 
              to="/clients" 
              className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>Clients</span>
            </NavLink>
            
            <NavLink 
              to="/estimates" 
              className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <FileText size={18} />
              <span>Estimates</span>
            </NavLink>

            <NavLink 
              to="/receipts" 
              className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Receipt size={18} />
              <span>Receipts</span>
            </NavLink>

            <NavLink 
              to="/payments" 
              className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <CreditCard size={18} />
              <span>Payment Methods</span>
            </NavLink>
            
            <NavLink 
              to="/settings" 
              className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Settings size={18} />
              <span>Settings</span>
            </NavLink>
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p>Version 0.1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;