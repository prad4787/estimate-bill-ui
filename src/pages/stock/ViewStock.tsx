import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Edit2, Package, Calendar, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { useStockStore } from "../../store/stockStore";
import { Stock } from "../../types";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Pagination from "../../components/ui/Pagination";

const ViewStock: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { stockBillItems, loading, getStock, fetchStockBillItems } =
    useStockStore();

  const [stock, setStock] = useState<Stock | null>(null);
  const [stockLoading, setStockLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchStock = async () => {
      if (!id) return;

      try {
        setStockLoading(true);
        const stockData = await getStock(id);
        if (stockData) {
          setStock(stockData);
        } else {
          toast.error("Stock not found");
        }
      } catch (error) {
        toast.error("Failed to fetch stock details");
      } finally {
        setStockLoading(false);
      }
    };

    fetchStock();
  }, [id, getStock]);

  useEffect(() => {
    if (id) {
      fetchStockBillItems(id, currentPage);
    }
  }, [id, currentPage, fetchStockBillItems]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getQuantityDisplay = () => {
    if (stock?.quantity === null) {
      return "Not tracked";
    }
    return stock?.quantity?.toString() || "0";
  };

  const getQuantityColor = () => {
    if (stock?.quantity === null) {
      return "text-gray-500";
    }
    if (stock?.quantity === 0) {
      return "text-red-600";
    }
    if (stock?.quantity && stock?.quantity < 10) {
      return "text-yellow-600";
    }
    return "text-green-600";
  };

  if (stockLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <div className="text-red-500 mb-4">Stock not found</div>
          <Link to="/stock" className="btn btn-primary">
            Back to Stock List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link to="/stock" className="btn btn-outline">
            <ArrowLeft size={18} />
            Back
          </Link>
          <div>
            <h1 className="page-title">{stock.name}</h1>
            <p className="text-gray-600 mt-2">
              Stock details and usage history
            </p>
          </div>
        </div>
        <Link to={`/stock/edit/${stock.id}`} className="btn btn-primary">
          <Edit2 size={18} />
          Edit Stock
        </Link>
      </div>

      {/* Stock Details Card */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="stats-icon bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <Package size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Quantity</p>
                <p className={`text-2xl font-bold ${getQuantityColor()}`}>
                  {getQuantityDisplay()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="stats-icon bg-gradient-to-br from-green-500 to-green-600 text-white">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stock.status === "tracked" ? "Tracked" : "Untracked"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="stats-icon bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Added</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDate(stock.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="stats-icon bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <Package size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stockBillItems.pagination?.total || 0}
                </p>
                <p className="text-xs text-gray-500">bill items</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Items Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Bill Items History</h3>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner />
            </div>
          ) : stockBillItems.data.length === 0 ? (
            <div className="text-center py-8">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No bill items found
              </h3>
              <p className="text-gray-600">
                This stock item hasn't been used in any bills yet.
              </p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="w-full">
                  <thead className="table-header">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        SN
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Bill Number
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                        Quantity
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                        Rate
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stockBillItems.data.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(currentPage - 1) * 10 + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.bill ? formatDate(item.bill.date) : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.bill ? (
                            <Link
                              to={`/bills/${item.billId}`}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {item.bill.number}
                            </Link>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ₹{item.rate.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-bold">
                          ₹{item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {stockBillItems.pagination &&
                stockBillItems.pagination.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={stockBillItems.pagination.totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewStock;
