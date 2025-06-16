import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, FileText, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { useEstimateStore } from "../../store/estimateStore";
import { useClientStore } from "../../store/clientStore";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Estimate } from "../../types";

const ITEMS_PER_PAGE = 10;

const EstimateList: React.FC = () => {
  const {
    estimates,
    loading,
    error: estimateError,
    pagination,
    fetchEstimates,
    deleteEstimate,
  } = useEstimateStore();
  const { clients, fetchClients } = useClientStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingEstimateId, setDeletingEstimateId] = useState<
    Estimate["id"] | null
  >(null);

  useEffect(() => {
    fetchEstimates({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: searchTerm,
    });
    fetchClients();
  }, [fetchEstimates, fetchClients, currentPage, searchTerm]);

  const handleDelete = async (id: Estimate["id"]) => {
    if (window.confirm("Are you sure you want to delete this estimate?")) {
      setDeletingEstimateId(id);
      try {
        const success = await deleteEstimate(id);
        if (success) {
          toast.success("Estimate deleted successfully");
          // Refresh the list
          fetchEstimates({
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            search: searchTerm,
          });
        } else {
          toast.error("Failed to delete estimate");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete estimate";
        toast.error(errorMessage);
      } finally {
        setDeletingEstimateId(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => String(c.id) === clientId);
    return client ? client.name : "N/A";
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (estimateError) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-medium mb-2">Error</h2>
        <p className="text-gray-500 mb-6">{estimateError}</p>
        <button
          onClick={() =>
            fetchEstimates({
              page: currentPage,
              limit: ITEMS_PER_PAGE,
              search: searchTerm,
            })
          }
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1>Estimates</h1>
        <Link
          to="/estimates/add"
          className="btn btn-primary inline-flex items-center"
        >
          <Plus size={16} className="mr-1" />
          Create Estimate
        </Link>
      </div>

      {(estimates || []).length > 0 && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search estimates by client name or number..."
            className="form-input pl-10 border-gray-300"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      )}

      {(estimates || []).length === 0 ? (
        <EmptyState
          title="No estimates found"
          description="Create your first estimate to get started."
          icon={<FileText size={48} />}
          action={
            <Link to="/estimates/add" className="btn btn-primary">
              Create Estimate
            </Link>
          }
        />
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {estimates.map((estimate) => (
                  <tr key={estimate.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {estimate.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(estimate.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getClientName(estimate.clientId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(estimate.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/estimates/${estimate.id}`}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        <Eye size={16} className="inline-block" />
                      </Link>
                      <button
                        onClick={() => handleDelete(estimate.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={deletingEstimateId === estimate.id}
                      >
                        {deletingEstimateId === estimate.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-outline px-3 py-1"
              >
                Previous
              </button>
              <span className="px-4 py-1 text-gray-700">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="btn btn-outline px-3 py-1"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EstimateList;
