import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Package } from "lucide-react";
import toast from "react-hot-toast";
import { useStockStore } from "../../store/stockStore";
import StockCard from "../../components/stock/StockCard";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";

const StockList: React.FC = () => {
  const {
    stocks,
    loading,
    error,
    pagination,
    stats,
    fetchStocks,
    fetchStockStats,
    deleteStock,
  } = useStockStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "tracked" | "untracked">(
    "all"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch stocks when search term or page changes
  useEffect(() => {
    fetchStocks(debouncedSearchTerm, currentPage);
  }, [debouncedSearchTerm, currentPage, fetchStocks]);

  // Fetch stats on component mount
  useEffect(() => {
    fetchStockStats();
  }, [fetchStockStats]);

  const handleDelete = async (id: string) => {
    const success = await deleteStock(id);
    if (success) {
      toast.success("Stock deleted successfully");
      // Refresh the list and stats
      fetchStocks(debouncedSearchTerm, currentPage);
      fetchStockStats();
    } else {
      toast.error("Failed to delete stock");
    }
  };

  // Filter stocks based on filter type
  const filteredStocks = stocks.filter((stock) => {
    if (filterType === "all") return true;
    if (filterType === "tracked") return stock.status === "tracked";
    if (filterType === "untracked") return stock.status === "untracked";
    return true;
  });

  if (error) {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <button
            onClick={() => fetchStocks(debouncedSearchTerm, currentPage)}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your inventory and track stock levels.
          </p>
        </div>
        <Link to="/stock/add" className="btn btn-primary">
          <Plus size={18} />
          Add Stock
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="stats-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Items
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.total}
                </h3>
              </div>
              <div className="stats-icon bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <Package size={24} />
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Tracked
                </p>
                <h3 className="text-3xl font-bold text-green-600">
                  {stats.tracked}
                </h3>
              </div>
              <div className="stats-icon bg-gradient-to-br from-green-500 to-green-600 text-white">
                <Package size={24} />
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Untracked
                </p>
                <h3 className="text-3xl font-bold text-gray-600">
                  {stats.untracked}
                </h3>
              </div>
              <div className="stats-icon bg-gradient-to-br from-gray-500 to-gray-600 text-white">
                <Package size={24} />
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Low Stock
                </p>
                <h3 className="text-3xl font-bold text-yellow-600">
                  {stats.lowStock}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{"< 10 items"}</p>
              </div>
              <div className="stats-icon bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                <Package size={24} />
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Out of Stock
                </p>
                <h3 className="text-3xl font-bold text-red-600">
                  {stats.outOfStock}
                </h3>
              </div>
              <div className="stats-icon bg-gradient-to-br from-red-500 to-red-600 text-white">
                <Package size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

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
                onChange={(e) =>
                  setFilterType(
                    e.target.value as "all" | "tracked" | "untracked"
                  )
                }
              >
                <option value="all">All Items</option>
                <option value="tracked">Tracked Only</option>
                <option value="untracked">Untracked Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading stocks...</p>
          </div>
        </div>
      ) : filteredStocks.length === 0 ? (
        <EmptyState
          title="No stock items found"
          description="Add your first stock item to get started with inventory management."
          icon={<Package size={64} />}
          action={
            <Link to="/stock/add" className="btn btn-primary">
              <Plus size={18} />
              Add Stock
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStocks.map((stock, index) => (
              <div
                key={stock.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <StockCard stock={stock} onDelete={handleDelete} />
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StockList;
