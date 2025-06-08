import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useReceiptStore } from '../../store/receiptStore';
import { useClientStore } from '../../store/clientStore';
import { Transaction, Client, PaymentType, PaymentMedium } from '../../types';
import ClientModal from '../../components/clients/ClientModal';

const AddReceipt: React.FC = () => {
  const navigate = useNavigate();
  const { addReceipt } = useReceiptStore();
  const { clients, fetchClients } = useClientStore();
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<Omit<Transaction, 'id'>[]>([{
    amount: 0,
    paymentType: 'cash',
  }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMedium[]>([]);
  const [showClientModal, setShowClientModal] = useState(false);

  useEffect(() => {
    fetchClients();
    // Load saved payment methods from localStorage
    const methods = localStorage.getItem('billmanager-payment-methods');
    if (methods) {
      setSavedPaymentMethods(JSON.parse(methods));
    }
  }, [fetchClients]);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClientCreated = (newClient: Client) => {
    setSelectedClient(newClient.id);
    setShowClientModal(false);
    fetchClients(); // Refresh the clients list
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

      // Reset payment medium and cheque details when payment type changes
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
      return null; // Cash only needs amount
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

    // For bank and wallet transactions
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

    // Validate required fields for cheque transactions
    const invalidCheque = transactions.some(t => 
      t.paymentType === 'cheque' && 
      (!t.chequeDetails?.bankName || !t.chequeDetails?.chequeNumber || 
       !t.chequeDetails?.chequeName || !t.chequeDetails?.chequeDate)
    );

    if (invalidCheque) {
      toast.error('Please fill in all cheque details');
      return;
    }

    // Validate payment methods for bank and wallet transactions
    const invalidPaymentMethod = transactions.some(t => 
      (t.paymentType === 'bank' || t.paymentType === 'wallet') && !t.paymentMedium
    );

    if (invalidPaymentMethod) {
      toast.error('Please select payment methods for bank/wallet transactions');
      return;
    }

    setIsSubmitting(true);

    try {
      addReceipt({
        date,
        clientId: selectedClient,
        transactions,
      });
      
      toast.success('Receipt created successfully');
      navigate('/receipts');
    } catch (error) {
      toast.error('Failed to create receipt');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalAmount = () => {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <button 
          onClick={() => navigate('/receipts')}
          className="inline-flex items-center text-gray-600 mb-6"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Receipts
        </button>
        <div className="page-header">
          <div>
            <h1 className="page-title">Create Receipt</h1>
            <p className="text-gray-600 mt-2">Record payment transactions from your clients.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card">
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
                        onFocus={() => {
                          setShowClientSearch(true);
                        }}
                        onBlur={() => {
                          // Delay hiding to allow clicking on dropdown items
                          setTimeout(() => setShowClientSearch(false), 200);
                        }}
                      />
                      {showClientSearch && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {searchTerm.length === 0 ? (
                            // Show all clients when no search term
                            clients.length > 0 ? (
                              <>
                                <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">
                                  All Clients ({clients.length})
                                </div>
                                {clients.slice(0, 10).map(client => (
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
                                ))}
                                {clients.length > 10 && (
                                  <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 text-center">
                                    Type to search through all {clients.length} clients
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="p-4 text-gray-500 text-center">
                                No clients found. Create your first client below.
                              </div>
                            )
                          ) : filteredClients.length > 0 ? (
                            // Show filtered results when searching
                            <>
                              <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">
                                Search Results ({filteredClients.length})
                              </div>
                              {filteredClients.map(client => (
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
                              ))}
                            </>
                          ) : (
                            // No search results
                            <div className="p-4 text-gray-500 text-center">
                              No clients match "{searchTerm}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white text-gray-500 font-medium">Don't see your client?</span>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={() => setShowClientModal(true)}
                          className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
                        >
                          <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                            <UserPlus size={20} />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold">Create New Client</div>
                            <div className="text-sm text-blue-500">Add a new client to your database</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
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

        <div className="flex justify-end gap-4">
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
                Creating...
              </>
            ) : (
              'Create Receipt'
            )}
          </button>
        </div>
      </form>

      <ClientModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onClientCreated={handleClientCreated}
      />
    </div>
  );
};

export default AddReceipt;