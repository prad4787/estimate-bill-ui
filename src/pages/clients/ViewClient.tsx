import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  FileText,
  MapPin,
  Calendar,
  Download,
  Printer,
  Search,
} from "lucide-react";
import { useClientStore } from "../../store/clientStore";
import { api } from "../../api";
import toast from "react-hot-toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

interface JournalEntry {
  id: string;
  date: string;
  particular: string;
  type: "bill" | "receipt";
  amount: number;
  dr: number;
  cr: number;
  balance: number;
  reference?: string;
  notes?: string;
}

const ViewClient: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClient, currentClient, currentClientLoading, currentClientError } =
    useClientStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "bill" | "receipt">(
    "all"
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);
        await getClient(id);
        await fetchJournalEntries();
      } catch (err) {
        setError("Failed to load client data");
        console.error("Error loading client data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, getClient]);

  const fetchJournalEntries = async () => {
    if (!id) return;

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });

      if (filterType !== "all") {
        params.append("type", filterType);
      }

      if (startDate) {
        params.append("startDate", startDate);
      }

      if (endDate) {
        params.append("endDate", endDate);
      }

      // const response = await api.get(
      //   `/journal/clients/${id}/entries?${params}`
      // );
      setJournalEntries([]);
      setTotalPages(0);
    } catch (err) {
      toast.error("Failed to load journal entries");
      console.error("Error loading journal entries:", err);
    }
  };

  useEffect(() => {
    fetchJournalEntries();
  }, [currentPage, filterType, startDate, endDate]);

  const handleDeleteEntry = async (entryId: string) => {
    setEntryToDelete(entryId);
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;

    try {
      await api.delete(`/journal/entries/${entryToDelete}`);
      toast.success("Journal entry deleted successfully");
      fetchJournalEntries();
    } catch (err) {
      toast.error("Failed to delete journal entry");
      console.error("Error deleting journal entry:", err);
    } finally {
      setEntryToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setEntryToDelete(null);
  };

  if (isLoading || currentClientLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <button
            onClick={() => navigate("/clients")}
            className="inline-flex items-center text-gray-600 mb-6"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Clients
          </button>

          <div className="page-header">
            <div>
              <h1 className="page-title">Loading...</h1>
              <p className="text-gray-600 mt-2">
                Please wait while we load the client data.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading client data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentClient || currentClientError) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-4">Client Not Found</h2>
          <p className="text-gray-500 mb-8">
            {currentClientError ||
              "The client you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => navigate("/clients")}
            className="btn btn-primary"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  // Filter entries based on search
  const filteredEntries = journalEntries.filter(
    (entry) =>
      entry.particular.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.reference &&
        entry.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.notes &&
        entry.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  const currentBalance =
    journalEntries[0]?.balance || currentClient.openingBalance;
  const totalBills = journalEntries.reduce((sum, entry) => sum + entry.dr, 0);
  const totalReceipts = journalEntries.reduce(
    (sum, entry) => sum + entry.cr,
    0
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <button
          onClick={() => navigate("/clients")}
          className="inline-flex items-center text-gray-600 mb-6"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Clients
        </button>

        <div className="page-header">
          <div>
            <h1 className="page-title">{currentClient.name}</h1>
            <p className="text-gray-600 mt-2">
              Complete transaction history and account details
            </p>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-outline">
              <Download size={18} />
              Export
            </button>
            <button className="btn btn-outline">
              <Printer size={18} />
              Print
            </button>
            <Link
              to={`/clients/edit/${currentClient.id}`}
              className="btn btn-primary"
            >
              <Edit2 size={18} />
              Edit Client
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="card">
          <div className="card-body">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Client Information Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">
            Client Information
          </h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} />
                <span className="text-sm font-medium">Client Since</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(currentClient.createdAt)}
              </p>
            </div>

            {currentClient.address && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  <span className="text-sm font-medium">Address</span>
                </div>
                <p className="text-gray-900">{currentClient.address}</p>
              </div>
            )}

            {currentClient.panVat && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText size={16} />
                  <span className="text-sm font-medium">PAN/VAT</span>
                </div>
                <p className="text-gray-900">{currentClient.panVat}</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <FileText size={16} />
                <span className="text-sm font-medium">Current Balance</span>
              </div>
              <p
                className={`text-lg font-semibold ${
                  currentBalance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(currentBalance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Journal Entries */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">
            Transaction History
          </h2>
        </div>
        <div className="card-body">
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="form-input pl-12 border-gray-300 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <select
                  className="form-select border-gray-300"
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(e.target.value as "all" | "bill" | "receipt")
                  }
                >
                  <option value="all">All Transactions</option>
                  <option value="bill">Bills Only</option>
                  <option value="receipt">Receipts Only</option>
                </select>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="form-input border-gray-300"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    className="form-input border-gray-300"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="End Date"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Bills</p>
                <p className="text-xl font-semibold text-red-600">
                  {formatCurrency(totalBills)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Receipts</p>
                <p className="text-xl font-semibold text-green-600">
                  {formatCurrency(totalReceipts)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Current Balance</p>
                <p
                  className={`text-xl font-semibold ${
                    currentBalance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(currentBalance)}
                </p>
              </div>
            </div>

            {/* Entries Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Particular
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Debit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(entry.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <p className="font-medium">{entry.particular}</p>
                          {entry.reference && (
                            <p className="text-gray-500 text-xs">
                              Ref: {entry.reference}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            entry.type === "bill"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {entry.type === "bill" ? "Bill" : "Receipt"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                        {entry.dr > 0 ? formatCurrency(entry.dr) : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                        {entry.cr > 0 ? formatCurrency(entry.cr) : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span
                          className={
                            entry.balance >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {formatCurrency(entry.balance)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!entryToDelete}
        title="Delete Journal Entry"
        message="Are you sure you want to delete this journal entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant="danger"
      />
    </div>
  );
};

export default ViewClient;
