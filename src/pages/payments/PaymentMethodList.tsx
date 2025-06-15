import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, CreditCard, Eye, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { usePaymentMethodStore } from "../../store/paymentMethodStore";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

const ITEMS_PER_PAGE = 10;

const PaymentMethodList: React.FC = () => {
  const {
    paymentMethods,
    loading,
    error,
    pagination,
    fetchPaymentMethods,
    deletePaymentMethod,
  } = usePaymentMethodStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentMethods(currentPage, ITEMS_PER_PAGE);
  }, [fetchPaymentMethods, currentPage]);

  const handleDeleteClick = (id: string) => {
    setMethodToDelete(id);
  };

  const handleDeleteConfirm = async () => {
    if (!methodToDelete) return;

    try {
      await deletePaymentMethod(methodToDelete);
      toast.success("Payment method deleted successfully");
      fetchPaymentMethods(currentPage, ITEMS_PER_PAGE);
    } catch (error) {
      toast.error("Failed to delete payment method");
      console.error("Error deleting payment method:", error);
    } finally {
      setMethodToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setMethodToDelete(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const filteredMethods = paymentMethods.filter(
    (method) =>
      (method.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      method.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (method.accountName &&
        method.accountName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (error) {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <button
            onClick={() => fetchPaymentMethods(currentPage, ITEMS_PER_PAGE)}
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
          <h1 className="page-title">Payment Methods</h1>
          <p className="text-gray-600 mt-2">
            Manage your payment methods and track their balances.
          </p>
        </div>
        <Link to="/payments/add" className="btn btn-primary">
          <Plus size={18} />
          Add Payment Method
        </Link>
      </div>

      {paymentMethods.length > 0 && (
        <div className="card">
          <div className="card-body">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search payment methods by name, type, or account..."
                className="form-input pl-12 border-gray-300 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payment methods...</p>
          </div>
        </div>
      ) : paymentMethods.length === 0 ? (
        <EmptyState
          title="No payment methods found"
          description="Add your first payment method to get started with payment tracking."
          icon={<CreditCard size={64} />}
          action={
            <Link to="/payments/add" className="btn btn-primary">
              <Plus size={18} />
              Add Payment Method
            </Link>
          }
        />
      ) : filteredMethods.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="empty-state-icon mx-auto mb-4">
              <Search size={48} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-500">
              No payment methods match your search criteria. Try adjusting your
              search terms.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="table-container">
              <table className="w-full">
                <thead className="table-header">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Account Details
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      Balance
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMethods.map((method) => (
                    <tr key={method.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {method.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {method.type.charAt(0).toUpperCase() +
                          method.type.slice(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {method.accountName && (
                          <div>
                            <div>{method.accountName}</div>
                            {method.accountNumber && (
                              <div className="text-xs text-gray-400">
                                {method.accountNumber}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(method.balance || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {method.isDefault ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Default
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <Link
                            to={`/payments/${method.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            to={`/payments/${method.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(method.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      <ConfirmDialog
        isOpen={!!methodToDelete}
        title="Delete Payment Method"
        message="Are you sure you want to delete this payment method? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant="danger"
      />
    </div>
  );
};

export default PaymentMethodList;
