import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, FileText, MapPin, Calendar, Plus, Eye, Download, Printer } from 'lucide-react';
import { useClientStore } from '../../store/clientStore';

interface JournalEntry {
  id: string;
  date: string;
  particular: string;
  type: 'bill' | 'receipt';
  dr: number;
  cr: number;
  balance: number;
}

const ViewClient: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClient, fetchClients } = useClientStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'bill' | 'receipt'>('all');
  
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const client = id ? getClient(id) : undefined;

  // Mock journal data - in real app, this would come from API
  const generateMockJournalData = (openingBalance: number): JournalEntry[] => {
    const entries: JournalEntry[] = [];
    let runningBalance = openingBalance;

    // Opening balance entry
    entries.push({
      id: 'opening',
      date: '2024-01-01',
      particular: 'Opening Balance',
      type: 'bill',
      dr: openingBalance > 0 ? openingBalance : 0,
      cr: openingBalance < 0 ? Math.abs(openingBalance) : 0,
      balance: runningBalance
    });

    // Generate 20 mock transactions
    const mockTransactions = [
      { date: '2024-01-15', particular: 'EST/2024/0001 - Website Development', type: 'bill' as const, amount: 2500 },
      { date: '2024-01-20', particular: 'RCP/2024/0001 - Payment Received', type: 'receipt' as const, amount: 1000 },
      { date: '2024-02-05', particular: 'EST/2024/0002 - Mobile App Design', type: 'bill' as const, amount: 3200 },
      { date: '2024-02-12', particular: 'RCP/2024/0002 - Partial Payment', type: 'receipt' as const, amount: 1500 },
      { date: '2024-02-28', particular: 'EST/2024/0003 - Database Setup', type: 'bill' as const, amount: 800 },
      { date: '2024-03-10', particular: 'RCP/2024/0003 - Payment Received', type: 'receipt' as const, amount: 2000 },
      { date: '2024-03-15', particular: 'EST/2024/0004 - API Integration', type: 'bill' as const, amount: 1800 },
      { date: '2024-03-22', particular: 'RCP/2024/0004 - Cash Payment', type: 'receipt' as const, amount: 800 },
      { date: '2024-04-01', particular: 'EST/2024/0005 - UI/UX Consulting', type: 'bill' as const, amount: 1200 },
      { date: '2024-04-08', particular: 'RCP/2024/0005 - Bank Transfer', type: 'receipt' as const, amount: 1800 },
      { date: '2024-04-20', particular: 'EST/2024/0006 - Security Audit', type: 'bill' as const, amount: 2200 },
      { date: '2024-05-02', particular: 'RCP/2024/0006 - Payment Received', type: 'receipt' as const, amount: 1200 },
      { date: '2024-05-15', particular: 'EST/2024/0007 - Performance Optimization', type: 'bill' as const, amount: 1500 },
      { date: '2024-05-25', particular: 'RCP/2024/0007 - Cheque Payment', type: 'receipt' as const, amount: 2200 },
      { date: '2024-06-05', particular: 'EST/2024/0008 - Maintenance Contract', type: 'bill' as const, amount: 3000 },
      { date: '2024-06-12', particular: 'RCP/2024/0008 - Advance Payment', type: 'receipt' as const, amount: 1500 },
      { date: '2024-06-28', particular: 'EST/2024/0009 - Training Services', type: 'bill' as const, amount: 900 },
      { date: '2024-07-08', particular: 'RCP/2024/0009 - Payment Received', type: 'receipt' as const, amount: 3000 },
      { date: '2024-07-20', particular: 'EST/2024/0010 - Documentation', type: 'bill' as const, amount: 600 },
      { date: '2024-07-30', particular: 'RCP/2024/0010 - Final Payment', type: 'receipt' as const, amount: 900 }
    ];

    mockTransactions.forEach((transaction, index) => {
      const dr = transaction.type === 'bill' ? transaction.amount : 0;
      const cr = transaction.type === 'receipt' ? transaction.amount : 0;
      runningBalance += dr - cr;

      entries.push({
        id: `entry-${index + 1}`,
        date: transaction.date,
        particular: transaction.particular,
        type: transaction.type,
        dr,
        cr,
        balance: runningBalance
      });
    });

    return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  if (!client) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-4">Client Not Found</h2>
          <p className="text-gray-500 mb-8">The client you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/clients')}
            className="btn btn-primary"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  const journalEntries = generateMockJournalData(client.openingBalance);

  // Filter entries based on search and type
  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = entry.particular.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || entry.type === filterType || entry.particular === 'Opening Balance';
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  const currentBalance = journalEntries[journalEntries.length - 1]?.balance || client.openingBalance;
  const totalBills = journalEntries.reduce((sum, entry) => sum + entry.dr, 0);
  const totalReceipts = journalEntries.reduce((sum, entry) => sum + entry.cr, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <button 
          onClick={() => navigate('/clients')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Clients
        </button>
        
        <div className="page-header">
          <div>
            <h1 className="page-title">{client.name}</h1>
            <p className="text-gray-600 mt-2">Complete transaction history and account details</p>
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
            <Link to={`/clients/edit/${client.id}`} className="btn btn-primary">
              <Edit2 size={18} />
              Edit Client
            </Link>
          </div>
        </div>
      </div>

      {/* Client Information Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">Client Information</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} />
                <span className="text-sm font-medium">Client Since</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(client.createdAt)}
              </p>
            </div>

            {client.address && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  <span className="text-sm font-medium">Address</span>
                </div>
                <p className="text-gray-900">{client.address}</p>
              </div>
            )}

            {client.panVat && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText size={16} />
                  <span className="text-sm font-medium">PAN/VAT</span>
                </div>
                <p className="text-gray-900 font-mono">{client.panVat}</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-sm font-medium">Client ID</span>
              </div>
              <p className="text-gray-900 font-mono text-sm">{client.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stats-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Current Balance</p>
              <h3 className={`text-3xl font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(currentBalance))}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {currentBalance >= 0 ? 'Credit Balance' : 'Debit Balance'}
              </p>
            </div>
            <div className={`stats-icon ${currentBalance >= 0 ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-red-600'} text-white`}>
              <FileText size={24} />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Billed</p>
              <h3 className="text-3xl font-bold text-gray-900">{formatCurrency(totalBills)}</h3>
              <p className="text-sm text-gray-500 mt-1">All time bills</p>
            </div>
            <div className="stats-icon bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Plus size={24} />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Received</p>
              <h3 className="text-3xl font-bold text-gray-900">{formatCurrency(totalReceipts)}</h3>
              <p className="text-sm text-gray-500 mt-1">All time receipts</p>
            </div>
            <div className="stats-icon bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <FileText size={24} />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Transactions</p>
              <h3 className="text-3xl font-bold text-gray-900">{journalEntries.length}</h3>
              <p className="text-sm text-gray-500 mt-1">Total entries</p>
            </div>
            <div className="stats-icon bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <Eye size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Journal Table */}
      <div className="card">
        <div className="card-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Account Journal</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="form-input pl-10 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Eye size={18} className="text-gray-400" />
                </div>
              </div>
              <select
                className="form-input w-full sm:w-auto"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'bill' | 'receipt')}
              >
                <option value="all">All Transactions</option>
                <option value="bill">Bills Only</option>
                <option value="receipt">Receipts Only</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Particular</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Dr (Bills)</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Cr (Receipts)</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedEntries.map((entry, index) => (
                <tr 
                  key={entry.id} 
                  className={`table-row animate-slide-in ${entry.particular === 'Opening Balance' ? 'bg-blue-50' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {formatDate(entry.date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {entry.particular === 'Opening Balance' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-semibold text-blue-700">{entry.particular}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${entry.type === 'bill' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                          <span className="text-gray-900">{entry.particular}</span>
                          <span className={`badge ${entry.type === 'bill' ? 'badge-danger' : 'badge-success'}`}>
                            {entry.type === 'bill' ? 'Bill' : 'Receipt'}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    {entry.dr > 0 ? (
                      <span className="font-semibold text-red-600">{formatCurrency(entry.dr)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    {entry.cr > 0 ? (
                      <span className="font-semibold text-green-600">{formatCurrency(entry.cr)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <span className={`font-bold ${entry.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(entry.balance))}
                      <span className="text-xs ml-1 text-gray-500">
                        {entry.balance >= 0 ? 'Cr' : 'Dr'}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="card-footer">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredEntries.length)} of {filteredEntries.length} entries
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-outline btn-sm"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-outline btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewClient;