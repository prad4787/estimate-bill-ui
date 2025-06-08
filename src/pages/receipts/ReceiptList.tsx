import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Receipt, Search, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { useReceiptStore } from '../../store/receiptStore';
import { useClientStore } from '../../store/clientStore';
import EmptyState from '../../components/ui/EmptyState';

const ITEMS_PER_PAGE = 10;

const ReceiptList: React.FC = () => {
  const { receipts, fetchReceipts, deleteReceipt } = useReceiptStore();
  const { clients, fetchClients } = useClientStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    fetchReceipts();
    fetchClients();
  }, [fetchReceipts, fetchClients]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this receipt?')) {
      deleteReceipt(id);
      toast.success('Receipt deleted successfully');
    }
  };

  const handlePrint = (receiptId: string) => {
    const receipt = receipts.find(r => r.id === receiptId);
    const client = receipt ? clients.find(c => c.id === receipt.clientId) : null;
    
    if (!receipt || !client) {
      toast.error('Receipt or client data not found');
      return;
    }

    // Create thermal printer formatted content
    const thermalContent = generateThermalReceipt(receipt, client);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(thermalContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const generateThermalReceipt = (receipt: any, client: any) => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    };

    const formatPaymentType = (type: string) => {
      switch (type) {
        case 'cash': return 'CASH';
        case 'bank': return 'BANK';
        case 'wallet': return 'E-WALLET';
        case 'cheque': return 'CHEQUE';
        default: return type.toUpperCase();
      }
    };

    const getPaymentDetails = (transaction: any) => {
      if (transaction.paymentType === 'cash') {
        return 'Cash Payment';
      }
      
      if (transaction.paymentType === 'cheque' && transaction.chequeDetails) {
        return `Cheque: ${transaction.chequeDetails.chequeNumber}\nBank: ${transaction.chequeDetails.bankName}`;
      }
      
      if (transaction.paymentMedium) {
        if (transaction.paymentMedium.type === 'bank') {
          return `${transaction.paymentMedium.bankName}\nAcc: ${transaction.paymentMedium.accountNumber}`;
        }
        if (transaction.paymentMedium.type === 'wallet') {
          return `${transaction.paymentMedium.walletName}\nAcc: ${transaction.paymentMedium.accountNumber}`;
        }
      }
      
      return formatPaymentType(transaction.paymentType);
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Receipt - ${receipt.id}</title>
    <style>
        @media print {
            @page {
                size: 80mm auto;
                margin: 0;
            }
            body {
                margin: 0;
                padding: 0;
            }
        }
        
        body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.2;
            width: 80mm;
            margin: 0 auto;
            padding: 5mm;
            background: white;
            color: black;
        }
        
        .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        
        .company-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 2px;
        }
        
        .receipt-title {
            font-size: 14px;
            font-weight: bold;
            margin: 5px 0;
        }
        
        .receipt-info {
            margin-bottom: 10px;
            font-size: 11px;
        }
        
        .client-info {
            margin-bottom: 10px;
            border-bottom: 1px dashed #000;
            padding-bottom: 5px;
        }
        
        .transaction {
            margin-bottom: 8px;
            border-bottom: 1px dotted #ccc;
            padding-bottom: 5px;
        }
        
        .transaction:last-child {
            border-bottom: none;
        }
        
        .amount {
            font-weight: bold;
            font-size: 13px;
        }
        
        .total-section {
            border-top: 1px dashed #000;
            padding-top: 5px;
            margin-top: 10px;
            text-align: right;
        }
        
        .total-amount {
            font-size: 16px;
            font-weight: bold;
        }
        
        .footer {
            text-align: center;
            margin-top: 15px;
            border-top: 1px dashed #000;
            padding-top: 5px;
            font-size: 10px;
        }
        
        .line {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
        }
        
        .center {
            text-align: center;
        }
        
        .right {
            text-align: right;
        }
        
        .small {
            font-size: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">BILLMANAGER</div>
        <div class="small">Estimate & Bill Management</div>
        <div class="receipt-title">PAYMENT RECEIPT</div>
    </div>
    
    <div class="receipt-info">
        <div class="line">
            <span>Receipt ID:</span>
            <span>${receipt.id.substring(0, 12)}...</span>
        </div>
        <div class="line">
            <span>Date:</span>
            <span>${formatDate(receipt.date)}</span>
        </div>
        <div class="line">
            <span>Printed:</span>
            <span>${formatDate(new Date().toISOString())}</span>
        </div>
    </div>
    
    <div class="client-info">
        <div><strong>RECEIVED FROM:</strong></div>
        <div>${client.name}</div>
        ${client.address ? `<div class="small">${client.address}</div>` : ''}
        ${client.panVat ? `<div class="small">PAN/VAT: ${client.panVat}</div>` : ''}
    </div>
    
    <div><strong>PAYMENT DETAILS:</strong></div>
    ${receipt.transactions.map((transaction: any, index: number) => `
        <div class="transaction">
            <div class="line">
                <span>Payment ${index + 1}:</span>
                <span class="amount">${formatCurrency(transaction.amount)}</span>
            </div>
            <div class="line">
                <span>Method:</span>
                <span>${formatPaymentType(transaction.paymentType)}</span>
            </div>
            ${getPaymentDetails(transaction) !== formatPaymentType(transaction.paymentType) ? 
                `<div class="small" style="margin-top: 2px;">${getPaymentDetails(transaction).replace('\n', '<br>')}</div>` : ''}
        </div>
    `).join('')}
    
    <div class="total-section">
        <div class="line">
            <span>TOTAL RECEIVED:</span>
            <span class="total-amount">${formatCurrency(receipt.total)}</span>
        </div>
    </div>
    
    <div class="footer">
        <div>Thank you for your payment!</div>
        <div class="small">This is a computer generated receipt</div>
        <div class="small">No signature required</div>
    </div>
</body>
</html>`;
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

  const filteredReceipts = receipts
    .filter(receipt => 
      getClientName(receipt.clientId).toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPages = Math.ceil(filteredReceipts.length / ITEMS_PER_PAGE);
  const paginatedReceipts = filteredReceipts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Receipts</h1>
          <p className="text-gray-600 mt-2">Manage payment receipts and transaction records.</p>
        </div>
        <Link to="/receipts/add" className="btn btn-primary">
          <Plus size={18} />
          Create Receipt
        </Link>
      </div>

      {receipts.length > 0 && (
        <div className="card">
          <div className="card-body">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search receipts by client name..."
                className="form-input pl-12 border-gray-300 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {receipts.length === 0 ? (
        <EmptyState
          title="No receipts found"
          description="Create your first receipt to get started with payment tracking."
          icon={<Receipt size={64} />}
          action={
            <Link to="/receipts/add\" className="btn btn-primary">
              <Plus size={18} />
              Create Receipt
            </Link>
          }
        />
      ) : filteredReceipts.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="empty-state-icon mx-auto mb-4">
              <Search size={48} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500">No receipts match your search criteria. Try adjusting your search terms.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Client</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Transactions</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedReceipts.map((receipt, index) => (
                  <tr 
                    key={receipt.id} 
                    className="table-row animate-slide-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {formatDate(receipt.date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {getClientName(receipt.clientId)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ID: {receipt.id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(receipt.total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <span className="badge badge-primary">
                          {receipt.transactions.length} payment{receipt.transactions.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => handlePrint(receipt.id)}
                          className="action-btn action-btn-primary"
                          title="Print thermal receipt"
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(receipt.id)}
                          className="action-btn action-btn-danger"
                          title="Delete receipt"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="card">
              <div className="card-footer">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredReceipts.length)} of {filteredReceipts.length} receipts
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
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReceiptList;