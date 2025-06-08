import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FileText, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEstimateStore } from '../../store/estimateStore';
import { useClientStore } from '../../store/clientStore';
import EmptyState from '../../components/ui/EmptyState';

const ITEMS_PER_PAGE = 10;

const EstimateList: React.FC = () => {
  const { estimates, fetchEstimates, deleteEstimate } = useEstimateStore();
  const { clients, fetchClients } = useClientStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    fetchEstimates();
    fetchClients();
  }, [fetchEstimates, fetchClients]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this estimate?')) {
      deleteEstimate(id);
      toast.success('Estimate deleted successfully');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getClientName = (clientId: string) => {
    return clients.find(client => client.id === clientId)?.name || 'Unknown Client';
  };

  const filteredEstimates = estimates
    .filter(estimate => 
      getClientName(estimate.clientId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      estimate.number.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPages = Math.ceil(filteredEstimates.length / ITEMS_PER_PAGE);
  const paginatedEstimates = filteredEstimates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1>Estimates</h1>
        <Link to="/estimates/add" className="btn btn-primary inline-flex items-center">
          <Plus size={16} className="mr-1" />
          Create Estimate
        </Link>
      </div>

      {estimates.length > 0 && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search estimates by client name or number..."
            className="form-input pl-10 border-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {estimates.length === 0 ? (
        <EmptyState
          title="No estimates found"
          description="Create your first estimate to get started."
          icon={<FileText size={48} />}
          action={
            <Link to="/estimates/add\" className="btn btn-primary">
              Create Estimate
            </Link>
          }
        />
      ) : filteredEstimates.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No estimates match your search.</p>
        </div>
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
                {paginatedEstimates.map((estimate) => (
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
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn btn-outline px-3 py-1"
              >
                Previous
              </button>
              <span className="px-4 py-1 text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
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