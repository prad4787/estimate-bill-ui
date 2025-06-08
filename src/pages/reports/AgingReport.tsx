import React, { useState, useEffect } from 'react';
import { Printer, Download, Calendar, DollarSign, FileText, TrendingDown, Search } from 'lucide-react';
import { useBillStore } from '../../store/billStore';
import { useClientStore } from '../../store/clientStore';
import { useOrganizationStore } from '../../store/organizationStore';
import { Bill } from '../../types';

interface ClientAgingData {
  clientId: string;
  clientName: string;
  current: number;
  oneToThree: number;
  threeToSix: number;
  sixToTwelve: number;
  overTwelve: number;
  total: number;
  bills: Bill[];
}

const AgingReport: React.FC = () => {
  const { bills, fetchBills, getAgingReport } = useBillStore();
  const { clients, fetchClients } = useClientStore();
  const { organization, fetchOrganization } = useOrganizationStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBills();
    fetchClients();
    fetchOrganization();
  }, [fetchBills, fetchClients, fetchOrganization]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysPastDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const daysPastDue = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return daysPastDue;
  };

  const getClientAgingData = (): ClientAgingData[] => {
    const agingData = getAgingReport();
    const allUnpaidBills = [
      ...agingData.current,
      ...agingData.oneToThree,
      ...agingData.threeToSix,
      ...agingData.sixToTwelve,
      ...agingData.overTwelve
    ];

    // Group bills by client
    const clientGroups = new Map<string, Bill[]>();
    
    allUnpaidBills.forEach(bill => {
      const clientId = bill.clientId;
      if (!clientGroups.has(clientId)) {
        clientGroups.set(clientId, []);
      }
      clientGroups.get(clientId)!.push(bill);
    });

    // Calculate aging amounts for each client
    const clientAgingData: ClientAgingData[] = [];

    clientGroups.forEach((clientBills, clientId) => {
      const clientName = clients.find(c => c.id === clientId)?.name || 'Unknown Client';
      
      const agingAmounts = {
        current: 0,
        oneToThree: 0,
        threeToSix: 0,
        sixToTwelve: 0,
        overTwelve: 0
      };

      clientBills.forEach(bill => {
        const daysPastDue = getDaysPastDue(bill.dueDate);
        
        if (daysPastDue <= 30) {
          agingAmounts.current += bill.remainingAmount;
        } else if (daysPastDue <= 90) {
          agingAmounts.oneToThree += bill.remainingAmount;
        } else if (daysPastDue <= 180) {
          agingAmounts.threeToSix += bill.remainingAmount;
        } else if (daysPastDue <= 365) {
          agingAmounts.sixToTwelve += bill.remainingAmount;
        } else {
          agingAmounts.overTwelve += bill.remainingAmount;
        }
      });

      const total = agingAmounts.current + agingAmounts.oneToThree + 
                   agingAmounts.threeToSix + agingAmounts.sixToTwelve + 
                   agingAmounts.overTwelve;

      if (total > 0) {
        clientAgingData.push({
          clientId,
          clientName,
          ...agingAmounts,
          total,
          bills: clientBills
        });
      }
    });

    return clientAgingData.sort((a, b) => b.total - a.total);
  };

  const clientAgingData = getClientAgingData();

  // Filter clients based on search term
  const filteredClientData = clientAgingData.filter(client =>
    client.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const totals = {
    current: filteredClientData.reduce((sum, client) => sum + client.current, 0),
    oneToThree: filteredClientData.reduce((sum, client) => sum + client.oneToThree, 0),
    threeToSix: filteredClientData.reduce((sum, client) => sum + client.threeToSix, 0),
    sixToTwelve: filteredClientData.reduce((sum, client) => sum + client.sixToTwelve, 0),
    overTwelve: filteredClientData.reduce((sum, client) => sum + client.overTwelve, 0),
    total: filteredClientData.reduce((sum, client) => sum + client.total, 0)
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create CSV content
    const csvContent = [
      ['Client Name', 'Current (0-30)', '31-90 Days', '91-180 Days', '181-365 Days', '365+ Days', 'Total Outstanding'].join(','),
      ...filteredClientData.map(client => [
        `"${client.clientName}"`,
        client.current,
        client.oneToThree,
        client.threeToSix,
        client.sixToTwelve,
        client.overTwelve,
        client.total
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client-aging-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header no-print">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl shadow-lg">
            <TrendingDown size={24} />
          </div>
          <div>
            <h1 className="page-title">Client Aging Report</h1>
            <p className="text-gray-600 mt-2">Track outstanding receivables by client across aging periods.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="btn btn-outline"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="btn btn-primary"
          >
            <Printer size={18} />
            Print Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
        <div className="stats-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Outstanding</p>
              <h3 className="text-3xl font-bold text-red-600">{formatCurrency(totals.total)}</h3>
              <p className="text-sm text-gray-500 mt-1">{filteredClientData.length} clients</p>
            </div>
            <div className="stats-icon bg-gradient-to-br from-red-500 to-red-600 text-white">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Current (0-30)</p>
              <h3 className="text-3xl font-bold text-blue-600">{formatCurrency(totals.current)}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {totals.total > 0 ? ((totals.current / totals.total) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="stats-icon bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Calendar size={24} />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">31-90 Days</p>
              <h3 className="text-3xl font-bold text-yellow-600">{formatCurrency(totals.oneToThree)}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {totals.total > 0 ? ((totals.oneToThree / totals.total) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="stats-icon bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <FileText size={24} />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">90+ Days</p>
              <h3 className="text-3xl font-bold text-red-600">
                {formatCurrency(totals.threeToSix + totals.sixToTwelve + totals.overTwelve)}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {totals.total > 0 ? (((totals.threeToSix + totals.sixToTwelve + totals.overTwelve) / totals.total) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="stats-icon bg-gradient-to-br from-red-500 to-red-600 text-white">
              <TrendingDown size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="card no-print">
        <div className="card-body">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search clients by name..."
              className="form-input pl-12 border-gray-300 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Client Aging Table */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Client Aging Summary</h2>
              <p className="text-gray-600 mt-1">
                Outstanding amounts by client across aging periods ({filteredClientData.length} clients)
              </p>
            </div>
            <div className="text-right no-print">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totals.total)}
              </div>
              <div className="text-sm text-gray-500">Total Outstanding</div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Client Name</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Current<br/>(0-30 days)</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">31-90<br/>Days</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">91-180<br/>Days</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">181-365<br/>Days</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">365+<br/>Days</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Total<br/>Outstanding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClientData.map((client, index) => (
                <tr 
                  key={client.clientId} 
                  className={`animate-slide-in ${
                    client.overTwelve > 0 ? 'bg-red-50' : 
                    client.threeToSix > 0 || client.sixToTwelve > 0 ? 'bg-yellow-50' : ''
                  }`}
                  style={{ animationDelay: `${index * 20}ms` }}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div>
                      <div className="font-semibold">{client.clientName}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {client.bills.length} unpaid bill{client.bills.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    {client.current > 0 ? (
                      <span className="font-semibold text-blue-600">{formatCurrency(client.current)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    {client.oneToThree > 0 ? (
                      <span className="font-semibold text-yellow-600">{formatCurrency(client.oneToThree)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    {client.threeToSix > 0 ? (
                      <span className="font-semibold text-orange-600">{formatCurrency(client.threeToSix)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    {client.sixToTwelve > 0 ? (
                      <span className="font-semibold text-red-600">{formatCurrency(client.sixToTwelve)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    {client.overTwelve > 0 ? (
                      <span className="font-bold text-red-700">{formatCurrency(client.overTwelve)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <span className="font-bold text-gray-900 text-lg">
                      {formatCurrency(client.total)}
                    </span>
                  </td>
                </tr>
              ))}
              
              {/* Totals Row */}
              <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                  TOTAL ({filteredClientData.length} clients)
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-blue-600">
                  {formatCurrency(totals.current)}
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-yellow-600">
                  {formatCurrency(totals.oneToThree)}
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-orange-600">
                  {formatCurrency(totals.threeToSix)}
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-red-600">
                  {formatCurrency(totals.sixToTwelve)}
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-red-700">
                  {formatCurrency(totals.overTwelve)}
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-gray-900 text-xl">
                  {formatCurrency(totals.total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {filteredClientData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">No clients found</div>
            <p className="text-sm text-gray-400">
              {searchTerm ? 'Try adjusting your search criteria' : 'No clients have unpaid bills'}
            </p>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-size: 12px;
          }
          
          .card {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
            margin-bottom: 20px;
          }
          
          .card-header {
            border-bottom: 2px solid #e5e7eb !important;
            background: #f9fafb !important;
          }
          
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          thead {
            display: table-header-group;
          }
          
          .page-title {
            font-size: 24px !important;
            margin-bottom: 10px;
          }
          
          .stats-card {
            border: 1px solid #e5e7eb !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AgingReport;