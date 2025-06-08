import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Package, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStockStore } from '../../store/stockStore';
import StockCard from '../../components/stock/StockCard';
import EmptyState from '../../components/ui/EmptyState';

const StockList: React.FC = () => {
  const { stocks, fetchStocks, deleteStock } = useStockStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'tracked' | 'untracked'>('all');
  
  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);
  
  const handleDelete = (id: string) => {
    deleteStock(id);
    toast.success('Stock deleted successfully');
  };
  
  // Filter stocks based on search term and filter type
  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch = stock.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterType === 'tracked') {
      matchesFilter = stock.quantity !== null;
    } else if (filterType === 'untracked') {
      matchesFilter = stock.quantity === null;
    }
    
    return matchesSearch && matchesFilter;
  });

  const getStockStats = () => {
    const totalItems = stocks.length;
    const trackedItems = stocks.filter(s => s.quantity !== null).length;
    const untrackedItems = stocks.filter(s => s.quantity === null).length;
    const lowStockItems = stocks.filter(s => s.quantity !== null && s.quantity < 10).length;
    const outOfStockItems = stocks.filter(s => s.quantity === 0).length;
    
    return {
      totalItems,
      trackedItems,
      untrackedItems,
      lowStockItems,
      outOfStockItems
    };
  };

  const stats = getStockStats();
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Management</h1>
          <p className="text-gray-600 mt-2">Manage your inventory and track stock levels.</p>
        </div>
        <Link to="/stock/add" className="btn btn-primary">
          <Plus size={18} />
          Add Stock
        </Link>
      </div>

      {/* Stats Cards */}
      {stocks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="stats-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Items</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.totalItems}</h3>
              </div>
              <div className="stats-icon bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <Package size={24} />
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Tracked</p>
                <h3 className="text-3xl font-bold text-green-600">{stats.trackedItems}</h3>
              </div>
              <div className="stats-icon bg-gradient-to-br from-green-500 to-green-600 text-white">
                <Package size={24} />
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Untracked</p>
                <h3 className="text-3xl font-bold text-gray-600">{stats.untrackedItems}</h3>
              </div>
              <div className="stats-icon bg-gradient-to-br from-gray-500 to-gray-600 text-white">
                <Package size={24} />
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Low Stock</p>
                <h3 className="text-3xl font-bold text-yellow-600">{stats.lowStockItems}</h3>
                <p className="text-xs text-gray-500 mt-1">{'< 10 items'}</p>
              </div>
              <div className="stats-icon bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                <Package size={24} />
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Out of Stock</p>
                <h3 className="text-3xl font-bold text-red-600">{stats.outOfStockItems}</h3>
              </div>
              <div className="stats-icon bg-gradient-to-br from-red-500 to-red-600 text-white">
                <Package size={24} />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {stocks.length > 0 && (
        <div className="card">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search stock items by name..."
                  className="form-input pl-12 border-gray-300 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <select
                  className="form-input"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'tracked' | 'untracked')}
                >
                  <option value="all">All Items</option>
                  <option value="tracked">Tracked Only</option>
                  <option value="untracked">Untracked Only</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {stocks.length === 0 ? (
        <EmptyState
          title="No stock items found"
          description="Add your first stock item to get started with inventory management."
          icon={<Package size={64} />}
          action={
            <Link to="/stock/add\" className="btn btn-primary">
              <Plus size={18} />
              Add Stock
            </Link>
          }
        />
      ) : filteredStocks.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="empty-state-icon mx-auto mb-4">
              <Search size={48} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500">No stock items match your search criteria. Try adjusting your search terms or filters.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStocks.map((stock, index) => (
            <div key={stock.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <StockCard
                stock={stock}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockList;