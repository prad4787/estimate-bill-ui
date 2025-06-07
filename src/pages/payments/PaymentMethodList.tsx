import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, DollarSign, FileText, Wallet, Building2, Edit2, Trash2 } from 'lucide-react';
import PaymentMediumModal from '../../components/payment/PaymentMediumModal';
import { PaymentMedium } from '../../types';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const PaymentMethodList: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMedium | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMedium[]>([]);

  useEffect(() => {
    // Load payment methods from localStorage
    const stored = localStorage.getItem('billmanager-payment-methods');
    if (stored) {
      setPaymentMethods(JSON.parse(stored));
    } else {
      // Initialize with default methods
      const defaultMethods: PaymentMedium[] = [
        { type: 'cash', balance: 0 },
        { type: 'cheque' }
      ];
      setPaymentMethods(defaultMethods);
      localStorage.setItem('billmanager-payment-methods', JSON.stringify(defaultMethods));
    }
  }, []);

  const savePaymentMethods = (methods: PaymentMedium[]) => {
    setPaymentMethods(methods);
    localStorage.setItem('billmanager-payment-methods', JSON.stringify(methods));
  };

  const handleSave = (payment: PaymentMedium) => {
    if (editingMethod) {
      // Update existing method
      const updatedMethods = paymentMethods.map(method => 
        method === editingMethod ? payment : method
      );
      savePaymentMethods(updatedMethods);
      toast.success('Payment method updated successfully');
      setEditingMethod(null);
    } else {
      // Add new method
      const updatedMethods = [...paymentMethods, payment];
      savePaymentMethods(updatedMethods);
      toast.success('Payment method added successfully');
    }
    setShowModal(false);
  };

  const handleEdit = (method: PaymentMedium) => {
    setEditingMethod(method);
    setShowModal(true);
  };

  const handleDelete = (methodToDelete: PaymentMedium) => {
    // Prevent deletion of default cash and cheque methods
    if (methodToDelete.type === 'cash' || methodToDelete.type === 'cheque') {
      toast.error('Cannot delete default payment methods');
      return;
    }

    if (window.confirm('Are you sure you want to delete this payment method?')) {
      const updatedMethods = paymentMethods.filter(method => method !== methodToDelete);
      savePaymentMethods(updatedMethods);
      toast.success('Payment method deleted successfully');
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'cash':
        return <DollarSign size={24} />;
      case 'cheque':
        return <FileText size={24} />;
      case 'bank':
        return <Building2 size={24} />;
      case 'wallet':
        return <Wallet size={24} />;
      default:
        return <CreditCard size={24} />;
    }
  };

  const getMethodColor = (type: string) => {
    switch (type) {
      case 'cash':
        return 'from-green-500 to-green-600';
      case 'cheque':
        return 'from-blue-500 to-blue-600';
      case 'bank':
        return 'from-purple-500 to-purple-600';
      case 'wallet':
        return 'from-indigo-500 to-indigo-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const renderPaymentDetails = (payment: PaymentMedium) => {
    switch (payment.type) {
      case 'cash':
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cash</h3>
            <p className="text-sm text-gray-600 mb-3">Physical cash payments</p>
            {payment.balance !== undefined && (
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(payment.balance)}
              </div>
            )}
          </div>
        );
      case 'cheque':
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cheque</h3>
            <p className="text-sm text-gray-600">Bank cheque payments</p>
          </div>
        );
      case 'wallet':
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{payment.walletName}</h3>
            <p className="text-sm text-gray-600 mb-1">{payment.accountName}</p>
            <p className="text-xs text-gray-500 mb-3 font-mono">{payment.accountNumber}</p>
            {payment.balance !== undefined && (
              <div className="text-xl font-bold text-indigo-600">
                {formatCurrency(payment.balance)}
              </div>
            )}
          </div>
        );
      case 'bank':
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{payment.bankName}</h3>
            <p className="text-sm text-gray-600 mb-1">{payment.accountName}</p>
            <p className="text-xs text-gray-500 mb-3 font-mono">{payment.accountNumber}</p>
            {payment.balance !== undefined && (
              <div className="text-xl font-bold text-purple-600">
                {formatCurrency(payment.balance)}
              </div>
            )}
          </div>
        );
    }
  };

  const canEdit = (method: PaymentMedium) => {
    return method.type === 'cash' || method.type === 'bank' || method.type === 'wallet';
  };

  const canDelete = (method: PaymentMedium) => {
    return method.type !== 'cash' && method.type !== 'cheque';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment Methods</h1>
          <p className="text-gray-600 mt-2">Manage your payment methods and account balances.</p>
        </div>
        <button
          onClick={() => {
            setEditingMethod(null);
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={18} />
          Add Payment Method
        </button>
      </div>

      {paymentMethods.length === 0 ? (
        <EmptyState
          title="No payment methods"
          description="Add your first payment method to get started."
          icon={<CreditCard size={48} />}
          action={
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary"
            >
              Add Payment Method
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentMethods.map((method, index) => (
            <div key={index} className="card group hover:shadow-xl transition-all duration-300">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className={`stats-icon bg-gradient-to-br ${getMethodColor(method.type)} text-white`}>
                    {getMethodIcon(method.type)}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {canEdit(method) && (
                      <button
                        onClick={() => handleEdit(method)}
                        className="action-btn action-btn-primary"
                        title="Edit payment method"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    {canDelete(method) && (
                      <button
                        onClick={() => handleDelete(method)}
                        className="action-btn action-btn-danger"
                        title="Delete payment method"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                
                {renderPaymentDetails(method)}
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className={`badge ${
                      method.type === 'cash' ? 'badge-success' :
                      method.type === 'cheque' ? 'badge-primary' :
                      method.type === 'bank' ? 'badge-warning' :
                      'badge-secondary'
                    }`}>
                      {method.type.charAt(0).toUpperCase() + method.type.slice(1)}
                    </span>
                    {(method.type === 'cash' || method.type === 'cheque') && (
                      <span className="text-xs text-gray-500 font-medium">Default</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PaymentMediumModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingMethod(null);
        }}
        onSave={handleSave}
        initialData={editingMethod}
      />
    </div>
  );
};

export default PaymentMethodList;