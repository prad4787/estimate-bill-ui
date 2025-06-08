import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Save, Plus, Trash2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useReceiptStore } from '../../store/receiptStore';
import { useClientStore } from '../../store/clientStore';
import { useOrganizationStore } from '../../store/organizationStore';
import { Transaction, Client, PaymentType, PaymentMedium } from '../../types';
import ClientModal from '../../components/clients/ClientModal';

const EditReceipt: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { receipts, updateReceipt } = useReceiptStore();
  const { clients, fetchClients } = useClientStore();
  const { organization, fetchOrganization } = useOrganizationStore();
  
  const [receipt, setReceipt] = useState<any>(null);
  const [date, setDate] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<Omit<Transaction, 'id'>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMedium[]>([]);
  const [showClientModal, setShowClientModal] = useState(false);

  useEffect(() => {
    fetchClients();
    fetchOrganization();
    
    // Load saved payment methods from localStorage
    const methods = localStorage.getItem('billmanager-payment-methods');
    if (methods) {
      setSavedPaymentMethods(JSON.parse(methods));
    }

    // Load receipt data
    if (id) {
      const foundReceipt = receipts.find(r => r.id === id);
      if (foundReceipt) {
        setReceipt(foundReceipt);
        setDate(foundReceipt.date);
        setSelectedClient(foundReceipt.clientId);
        setTransactions(foundReceipt.transactions.map(t => ({
          amount: t.amount,
          paymentType: t.paymentType,
          paymentMedium: t.paymentMedium,
          chequeDetails: t.chequeDetails
        })));
      }
    }
  }, [id, receipts, fetchClients, fetchOrganization]);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClientCreated = (newClient: Client) => {
    setSelectedClient(newClient.id);
    setShowClientModal(false);
    fetchClients();
  };

  const handleTransactionChange = (index: number, field: keyof Transaction | 'chequeDetails', value: any) => {
    const newTransactions = [...transactions];
    if (field === 'chequeDetails') {
      newTransactions[index] = {
        ...newTransactions[index],
        chequeDetails: {
          ...newTransactions[index].chequeDetails,
          ...value
        }
      };
    } else {
      newTransactions[index] = {
        ...newTransactions[index],
        [field]: value,
      };

      if (field === 'paymentType') {
        delete newTransactions[index].paymentMedium;
        delete newTransactions[index].chequeDetails;
      }
    }
    setTransactions(newTransactions);
  };

  const addTransaction = () => {
    setTransactions([...transactions, {
      amount: 0,
      paymentType: 'cash',
    }]);
  };

  const removeTransaction = (index: number) => {
    if (transactions.length > 1) {
      setTransactions(transactions.filter((_, i) => i !== index));
    }
  };

  const getRelevantMethods = (paymentType: PaymentType): PaymentMedium[] => {
    return savedPaymentMethods.filter(method => method.type === paymentType);
  };

  const formatPaymentMethodDisplay = (method: PaymentMedium): string => {
    switch (method.type) {
      case 'bank':
        return `${method.bankName} - ${method.accountName} (${method.accountNumber})`;
      case 'wallet':
        return `${method.walletName} - ${method.accountName} (${method.accountNumber})`;
      case 'cash':
        return 'Cash';
      default:
        return 'Payment Method';
    }
  };

  const renderPaymentMethodSelector = (transaction: Omit<Transaction, 'id'>, index: number) => {
    if (transaction.paymentType === 'cash') {
      return null;
    }

    if (transaction.paymentType === 'cheque') {
      return (
        <div className="space-y-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <h3 className="text-sm font-semibold text-yellow-800">Cheque Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Bank Name</label>
              <input
                type="text"
                className="form-input"
                value={transaction.chequeDetails?.bankName || ''}
                onChange={(e) => handleTransactionChange(index, 'chequeDetails', { 
                  ...transaction.chequeDetails,
                  bankName: e.target.value 
                })}
                placeholder="Enter bank name"
                required
              />
            </div>
            <div>
              <label className="form-label">Cheque Number</label>
              <input
                type="text"
                className="form-input"
                value={transaction.chequeDetails?.chequeNumber || ''}
                onChange={(e) => handleTransactionChange(index, 'chequeDetails', { 
                  ...transaction.chequeDetails,
                  chequeNumber: e.target.value 
                })}
                placeholder="Enter cheque number"
                required
              />
            </div>
            <div>
              <label className="form-label">Name on Cheque</label>
              <input
                type="text"
                className="form-input"
                value={transaction.chequeDetails?.chequeName || ''}
                onChange={(e) => handleTransactionChange(index, 'chequeDetails', { 
                  ...transaction.chequeDetails,
                  chequeName: e.target.value 
                })}
                placeholder="Enter name on cheque"
                required
              />
            </div>
            <div>
              <label className="form-label">Exchange Date</label>
              <input
                type="date"
                className="form-input"
                value={transaction.chequeDetails?.chequeDate || ''}
                onChange={(e) => handleTransactionChange(index, 'chequeDetails', { 
                  ...transaction.chequeDetails,
                  chequeDate: e.target.value 
                })}
                required
              />
            </div>
          </div>
        </div>
      );
    }

    const relevantMethods = getRelevantMethods(transaction.paymentType);

    if (relevantMethods.length === 0) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-800 mb-3">
            No {transaction.paymentType} accounts found. Please add a {transaction.paymentType} account first.
          </p>
          <button
            type="button"
            onClick={() => navigate('/payments')}
            className="btn btn-outline btn-sm"
          >
            Manage Payment Methods
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <label className="form-label">Select {transaction.paymentType === 'bank' ? 'Bank Account' : 'E-Wallet'}</label>
        <div className="space-y-2">
          {relevantMethods.map((method, methodIndex) => (
            <div
              key={methodIndex}
              className={`p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                transaction.paymentMedium === method
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => handleTransactionChange(index, 'paymentMedium', method)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatPaymentMethodDisplay(method)}
                  </div>
                  {method.balance !== undefined && (
                    <div className="text-xs text-gray-500 mt-1">
                      Balance: ${method.balance.toFixed(2)}
                    </div>
                  )}
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  transaction.paymentMedium === method
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {transaction.paymentMedium === method && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {transaction.paymentMedium && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
            <div className="text-sm text-green-800">
              <strong>Selected:</strong> {formatPaymentMethodDisplay(transaction.paymentMedium)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient) {
      toast.error('Please select a client');
      return;
    }

    if (transactions.some(t => t.amount <= 0)) {
      toast.error('All transaction amounts must be greater than 0');
      return;
    }

    const invalidCheque = transactions.some(t => 
      t.paymentType === 'cheque' && 
      (!t.chequeDetails?.bankName || !t.chequeDetails?.chequeNumber || 
       !t.chequeDetails?.chequeName || !t.chequeDetails?.chequeDate)
    );

    if (invalidCheque) {
      toast.error('Please fill in all cheque details');
      return;
    }

    const invalidPaymentMethod = transactions.some(t => 
      (t.paymentType === 'bank' || t.paymentType === 'wallet') && !t.paymentMedium
    );

    if (invalidPaymentMethod) {
      toast.error('Please select payment methods for bank/wallet transactions');
      return;
    }

    setIsSubmitting(true);

    try {
      const total = transactions.reduce((sum, t) => sum + t.amount, 0);
      
      updateReceipt(id!, {
        date,
        clientId: selectedClient,
        transactions: transactions.map(t => ({ ...t, id: `trans_${Date.now()}_${Math.random()}` })),
        total,
        updatedAt: new Date().toISOString(),
      });
      
      toast.success('Receipt updated successfully');
      navigate('/receipts');
    } catch (error) {
      toast.error('Failed to update receipt');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Create a new window with the receipt content for PDF generation
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const receiptContent = generateReceiptHTML();
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Trigger print dialog which can be used to save as PDF
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const generateReceiptHTML = () => {
    if (!receipt || !selectedClient) return '';

    const client = clients.find(c => c.id === selectedClient);
    if (!client) return '';

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
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
        case 'bank': return 'BANK TRANSFER';
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
        return `Cheque: ${transaction.chequeDetails.chequeNumber}<br>Bank: ${transaction.chequeDetails.bankName}<br>Name: ${transaction.chequeDetails.chequeName}`;
      }
      
      if (transaction.paymentMedium) {
        if (transaction.paymentMedium.type === 'bank') {
          return `${transaction.paymentMedium.bankName}<br>Account: ${transaction.paymentMedium.accountName}<br>Number: ${transaction.paymentMedium.accountNumber}`;
        }
        if (transaction.paymentMedium.type === 'wallet') {
          return `${transaction.paymentMedium.walletName}<br>Account: ${transaction.paymentMedium.accountName}<br>Number: ${transaction.paymentMedium.accountNumber}`;
        }
      }
      
      return formatPaymentType(transaction.paymentType);
    };

    const total = transactions.reduce((sum, t) => sum + t.amount, 0);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Receipt - ${receipt.id}</title>
    <style>
        @media print {
            @page {
                size: A4;
                margin: 20mm;
            }
            body {
                margin: 0;
                padding: 0;
            }
            .no-print {
                display: none !important;
            }
        }
        
        body {
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        
        .receipt-container {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 30px;
            background: white;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .company-logo {
            max-height: 80px;
            max-width: 200px;
            margin-bottom: 15px;
        }
        
        .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
        }
        
        .company-details {
            font-size: 12px;
            color: #6b7280;
            line-height: 1.4;
        }
        
        .receipt-title {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin: 20px 0 10px 0;
        }
        
        .receipt-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            gap: 40px;
        }
        
        .info-section {
            flex: 1;
        }
        
        .info-title {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
        }
        
        .info-content {
            font-size: 14px;
            color: #374151;
        }
        
        .info-line {
            margin-bottom: 5px;
        }
        
        .transactions-section {
            margin: 30px 0;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
        }
        
        .transaction {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            background: #f9fafb;
        }
        
        .transaction-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .transaction-amount {
            font-size: 20px;
            font-weight: bold;
            color: #059669;
        }
        
        .transaction-type {
            background: #dbeafe;
            color: #1e40af;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .transaction-details {
            font-size: 13px;
            color: #6b7280;
            line-height: 1.5;
        }
        
        .total-section {
            border-top: 2px solid #e5e7eb;
            padding-top: 20px;
            margin-top: 30px;
            text-align: right;
        }
        
        .total-amount {
            font-size: 28px;
            font-weight: bold;
            color: #059669;
        }
        
        .total-label {
            font-size: 18px;
            color: #374151;
            margin-bottom: 10px;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
        }
        
        .thank-you {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            ${organization.logo ? `<img src="${organization.logo}" alt="${organization.name}" class="company-logo">` : ''}
            <div class="company-name">${organization.name}</div>
            <div class="company-details">
                ${organization.address}<br>
                ${organization.phones.length > 0 ? `Phone: ${organization.phones[0]}` : ''} 
                ${organization.emails.length > 0 ? `| Email: ${organization.emails[0]}` : ''}<br>
                ${organization.website ? `Website: ${organization.website}` : ''}
            </div>
            <div class="receipt-title">PAYMENT RECEIPT</div>
        </div>
        
        <div class="receipt-info">
            <div class="info-section">
                <div class="info-title">Receipt Information</div>
                <div class="info-content">
                    <div class="info-line"><strong>Receipt ID:</strong> ${receipt.id}</div>
                    <div class="info-line"><strong>Date:</strong> ${formatDate(date)}</div>
                    <div class="info-line"><strong>Issued:</strong> ${formatDate(new Date().toISOString())}</div>
                </div>
            </div>
            
            <div class="info-section">
                <div class="info-title">Received From</div>
                <div class="info-content">
                    <div class="info-line"><strong>${client.name}</strong></div>
                    ${client.address ? `<div class="info-line">${client.address}</div>` : ''}
                    ${client.panVat ? `<div class="info-line">PAN/VAT: ${client.panVat}</div>` : ''}
                </div>
            </div>
        </div>
        
        <div class="transactions-section">
            <div class="section-title">Payment Details</div>
            ${transactions.map((transaction, index) => `
                <div class="transaction">
                    <div class="transaction-header">
                        <div>
                            <div style="font-weight: 600; color: #1f2937;">Payment ${index + 1}</div>
                            <div class="transaction-type">${formatPaymentType(transaction.paymentType)}</div>
                        </div>
                        <div class="transaction-amount">${formatCurrency(transaction.amount)}</div>
                    </div>
                    <div class="transaction-details">
                        ${getPaymentDetails(transaction)}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="total-section">
            <div class="total-label">Total Amount Received:</div>
            <div class="total-amount">${formatCurrency(total)}</div>
        </div>
        
        <div class="footer">
            <div class="thank-you">Thank you for your payment!</div>
            <div>This is a computer-generated receipt and does not require a signature.</div>
            ${organization.website ? `<div style="margin-top: 10px;">${organization.website}</div>` : ''}
        </div>
    </div>
</body>
</html>`;
  };

  const getTotalAmount = () => {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  };

  if (!receipt) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-4">Receipt Not Found</h2>
          <p className="text-gray-500 mb-8">The receipt you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/receipts')}
            className="btn btn-primary"
          >
            Back to Receipts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="no-print">
        <button 
          onClick={() => navigate('/receipts')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Receipts
        </button>
        <div className="page-header">
          <div>
            <h1 className="page-title">Edit Receipt</h1>
            <p className="text-gray-600 mt-2">Update payment transaction details.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="btn btn-outline"
            >
              <Printer size={18} />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="btn btn-outline"
            >
              <Download size={18} />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card no-print">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Receipt Information</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <label className="form-label">Client</label>
                {selectedClient ? (
                  <div className="flex justify-between items-center p-4 border border-gray-300 rounded-xl bg-gradient-to-r from-green-50 to-green-100">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {clients.find(c => c.id === selectedClient)?.name}
                      </div>
                      {clients.find(c => c.id === selectedClient)?.address && (
                        <div className="text-sm text-gray-600">
                          {clients.find(c => c.id === selectedClient)?.address}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedClient('')}
                      className="btn btn-outline btn-sm"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Search existing clients..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowClientSearch(true);
                        }}
                      />
                      {showClientSearch && searchTerm && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {filteredClients.length > 0 ? (
                            filteredClients.map(client => (
                              <div
                                key={client.id}
                                className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => {
                                  setSelectedClient(client.id);
                                  setShowClientSearch(false);
                                  setSearchTerm('');
                                }}
                              >
                                <div className="font-medium text-gray-900">{client.name}</div>
                                {client.address && (
                                  <div className="text-sm text-gray-500">{client.address}</div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-gray-500 text-center">
                              No clients found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1 border-t border-gray-300"></div>
                      <span className="text-sm text-gray-500 font-medium">OR</span>
                      <div className="flex-1 border-t border-gray-300"></div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShowClientModal(true)}
                      className="btn btn-outline w-full"
                    >
                      <UserPlus size={18} />
                      Create New Client
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card no-print">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Transactions</h2>
              <div className="text-xl font-bold text-green-600">
                Total: ${getTotalAmount().toFixed(2)}
              </div>
            </div>
          </div>
          <div className="card-body space-y-6">
            {transactions.map((transaction, index) => (
              <div key={index} className="relative card border-l-4 border-l-green-500">
                {transactions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTransaction(index)}
                    className="absolute top-4 right-4 action-btn action-btn-danger"
                    title="Remove transaction"
                  >
                    <Trash2 size={18} />
                  </button>
                )}

                <div className="card-body space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Amount ($)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          className="form-input pl-8"
                          value={transaction.amount || ''}
                          onChange={(e) => handleTransactionChange(index, 'amount', Number(e.target.value))}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Payment Type</label>
                      <select
                        className="form-input"
                        value={transaction.paymentType}
                        onChange={(e) => handleTransactionChange(index, 'paymentType', e.target.value as PaymentType)}
                      >
                        <option value="cash">Cash</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="wallet">E-Wallet</option>
                        <option value="cheque">Cheque</option>
                      </select>
                    </div>
                  </div>

                  {(transaction.paymentType === 'bank' || transaction.paymentType === 'wallet' || transaction.paymentType === 'cheque') && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      {renderPaymentMethodSelector(transaction, index)}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addTransaction}
              className="btn btn-outline w-full"
            >
              <Plus size={18} />
              Add Another Transaction
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-4 no-print">
          <button
            type="button"
            onClick={() => navigate('/receipts')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner" />
                Updating...
              </>
            ) : (
              <>
                <Save size={18} />
                Update Receipt
              </>
            )}
          </button>
        </div>
      </form>

      <ClientModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onClientCreated={handleClientCreated}
      />

      {/* Print-only Receipt Display */}
      <div className="print-only" style={{ display: 'none' }}>
        <div dangerouslySetInnerHTML={{ __html: generateReceiptHTML() }} />
      </div>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default EditReceipt;