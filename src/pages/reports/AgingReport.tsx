import React, { useState, useEffect } from 'react';
import { Printer, Download, Calendar, DollarSign, FileText, TrendingDown } from 'lucide-react';
import { useBillStore } from '../../store/billStore';
import { useClientStore } from '../../store/clientStore';
import { useOrganizationStore } from '../../store/organizationStore';
import { Bill, AgingBucket } from '../../types';

const AgingReport: React.FC = () => {
  const { bills, fetchBills, getAgingReport } = useBillStore();
  const { clients, fetchClients } = useClientStore();
  const { organization, fetchOrganization } = useOrganizationStore();
  const [selectedBucket, setSelectedBucket] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBills();
    fetchClients();
    fetchOrganization();
  }, [fetchBills, fetchClients, fetchOrganization]);

  const agingData = getAgingReport();

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

  const getStatusBadge = (bill: Bill) => {
    const daysPastDue = getDaysPastDue(bill.dueDate);
    
    if (bill.status === 'paid') {
      return <span className="badge badge-success">Paid</span>;
    } else if (daysPastDue <= 0) {
      return <span className="badge badge-primary">Current</span>;
    } else if (daysPastDue <= 30) {
      return <span className="badge badge-warning">1-30 Days</span>;
    } else if (daysPastDue <= 90) {
      return <span className="badge badge-danger">31-90 Days</span>;
    } else {
      return <span className="badge" style={{ backgroundColor: '#dc2626', color: 'white' }}>90+ Days</span>;
    }
  };

  const agingBuckets: AgingBucket[] = [
    {
      label: 'Current (0-30 days)',
      range: '0-30',
      bills: agingData.current,
      totalAmount: agingData.current.reduce((sum, bill) => sum + bill.remainingAmount, 0),
      count: agingData.current.length
    },
    {
      label: '31-90 days',
      range: '31-90',
      bills: agingData.oneToThree,
      totalAmount: agingData.oneToThree.reduce((sum, bill) => sum + bill.remainingAmount, 0),
      count: agingData.oneToThree.length
    },
    {
      label: '91-180 days',
      range: '91-180',
      bills: agingData.threeToSix,
      totalAmount: agingData.threeToSix.reduce((sum, bill) => sum + bill.remainingAmount, 0),
      count: agingData.threeToSix.length
    },
    {
      label: '181-365 days',
      range: '181-365',
      bills: agingData.sixToTwelve,
      totalAmount: agingData.sixToTwelve.reduce((sum, bill) => sum + bill.remainingAmount, 0),
      count: agingData.sixToTwelve.length
    },
    {
      label: '365+ days',
      range: '365+',
      bills: agingData.overTwelve,
      totalAmount: agingData.overTwelve.reduce((sum, bill) => sum + bill.remainingAmount, 0),
      count: agingData.overTwelve.length
    }
  ];

  const getAllUnpaidBills = () => {
    return [
      ...agingData.current,
      ...agingData.oneToThree,
      ...agingData.threeToSix,
      ...agingData.sixToTwelve,
      ...agingData.overTwelve
    ];
  };

  const getFilteredBills = () => {
    let bills: Bill[] = [];
    
    if (selectedBucket === 'all') {
      bills = getAllUnpaidBills();
    } else {
      const bucket = agingBuckets.find(b => b.range === selectedBucket);
      bills = bucket ? bucket.bills : [];
    }

    if (searchTerm) {
      bills = bills.filter(bill => 
        bill.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return bills.sort((a, b) => getDaysPastDue(b.dueDate) - getDaysPastDue(a.dueDate));
  };

  const totalOutstanding = agingBuckets.reduce((sum, bucket) => sum + bucket.totalAmount, 0);
  const totalBills = agingBuckets.reduce((sum, bucket) => sum + bucket.count, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create CSV content
    const filteredBills = getFilteredBills();
    const csvContent = [
      ['Bill Number', 'Client Name', 'Issue Date', 'Due Date', 'Days Past Due', 'Original Amount', 'Paid Amount', 'Outstanding Amount', 'Status'].join(','),
      ...filteredBills.map(bill => [
        bill.billNumber,
        `"${bill.clientName}"`,
        formatDate(bill.issueDate),
        formatDate(bill.dueDate),
        getDaysPastDue(bill.dueDate),
        bill.amount,
        bill.paidAmount,
        bill.remainingAmount,
        bill.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aging-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredBills = getFilteredBills();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header no-print">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl shadow-lg">
            <TrendingDown size={24} />
          </div>
          <div>
            <h1 className="page-title">Aging Report</h1>
            <p className="text-gray-600 mt-2">Track outstanding receivables by aging periods.</p>
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
              <h3 className="text-3xl font-bold text-red-600">{formatCurrency(totalOutstanding)}</h3>
              <p className="text-sm text-gray-500 mt-1">{totalBills} unpaid bills</p>
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
              <h3 className="text-3xl font-bold text-blue-600">{formatCurrency(agingBuckets[0].totalAmount)}</h3>
              <p className="text-sm text-gray-500 mt-1">{agingBuckets[0].count} bills</p>
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
              <h3 className="text-3xl font-bold text-yellow-600">{formatCurrency(agingBuckets[1].totalAmount)}</h3>
              <p className="text-sm text-gray-500 mt-1">{agingBuckets[1].count} bills</p>
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
                {formatCurrency(agingBuckets[2].totalAmount + agingBuckets[3].totalAmount + agingBuckets[4].totalAmount)}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {agingBuckets[2].count + agingBuckets[3].count + agingBuckets[4].count} bills
              </p>
            </div>
            <div className="stats-icon bg-gradient-to-br from-red-500 to-red-600 text-white">
              <TrendingDown size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Aging Summary Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">Aging Summary</h2>
          <p className="text-gray-600 mt-1">Outstanding amounts by aging period</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Aging Period</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Count</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {agingBuckets.map((bucket, index) => (
                <tr key={bucket.range} className="table-row">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {bucket.label}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="badge badge-primary">{bucket.count}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                    {formatCurrency(bucket.totalAmount)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {totalOutstanding > 0 ? ((bucket.totalAmount / totalOutstanding) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td className="px-6 py-4 text-sm font-bold text-gray-900">Total</td>
                <td className="px-6 py-4 text-center text-sm font-bold text-gray-900">{totalBills}</td>
                <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                  {formatCurrency(totalOutstanding)}
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Filters */}
      <div className="card no-print">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by client name or bill number..."
                className="form-input w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                className="form-input w-full sm:w-auto"
                value={selectedBucket}
                onChange={(e) => setSelectedBucket(e.target.value)}
              >
                <option value="all">All Periods</option>
                {agingBuckets.map(bucket => (
                  <option key={bucket.range} value={bucket.range}>
                    {bucket.label} ({bucket.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Bills Table */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Detailed Aging Report</h2>
              <p className="text-gray-600 mt-1">
                {selectedBucket === 'all' ? 'All unpaid bills' : agingBuckets.find(b => b.range === selectedBucket)?.label} 
                {searchTerm && ` matching "${searchTerm}"`} ({filteredBills.length} bills)
              </p>
            </div>
            <div className="text-right no-print">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(filteredBills.reduce((sum, bill) => sum + bill.remainingAmount, 0))}
              </div>
              <div className="text-sm text-gray-500">Total Outstanding</div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Bill Number</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Client</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Issue Date</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Due Date</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Days Past Due</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Original Amount</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Paid Amount</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Outstanding</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBills.map((bill, index) => {
                const daysPastDue = getDaysPastDue(bill.dueDate);
                return (
                  <tr 
                    key={bill.id} 
                    className={`table-row animate-slide-in ${daysPastDue > 90 ? 'bg-red-50' : daysPastDue > 30 ? 'bg-yellow-50' : ''}`}
                    style={{ animationDelay: `${index * 20}ms` }}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {bill.billNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {bill.clientName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">
                      {formatDate(bill.issueDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">
                      {formatDate(bill.dueDate)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${
                        daysPastDue <= 0 ? 'text-green-600' :
                        daysPastDue <= 30 ? 'text-yellow-600' :
                        daysPastDue <= 90 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {daysPastDue <= 0 ? 'Current' : `${daysPastDue} days`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {formatCurrency(bill.amount)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-green-600">
                      {formatCurrency(bill.paidAmount)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-red-600">
                      {formatCurrency(bill.remainingAmount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(bill)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredBills.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">No bills found</div>
            <p className="text-sm text-gray-400">
              {searchTerm ? 'Try adjusting your search criteria' : 'No unpaid bills in this aging period'}
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