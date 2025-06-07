import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { PaymentType, PaymentMedium } from '../../types';

interface PaymentMediumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: PaymentMedium) => void;
  initialData?: PaymentMedium | null;
}

const PaymentMediumModal: React.FC<PaymentMediumModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [paymentType, setPaymentType] = useState<PaymentType>('bank');
  const [walletName, setWalletName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState<string>('0');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setPaymentType(initialData.type);
      if (initialData.type === 'wallet') {
        setWalletName(initialData.walletName || '');
        setAccountName(initialData.accountName || '');
        setAccountNumber(initialData.accountNumber || '');
        setBalance(initialData.balance?.toString() || '0');
      } else if (initialData.type === 'bank') {
        setBankName(initialData.bankName || '');
        setAccountName(initialData.accountName || '');
        setAccountNumber(initialData.accountNumber || '');
        setBalance(initialData.balance?.toString() || '0');
      } else if (initialData.type === 'cash') {
        setBalance(initialData.balance?.toString() || '0');
      }
    } else {
      // Reset form for new entry
      setPaymentType('bank');
      setWalletName('');
      setBankName('');
      setAccountName('');
      setAccountNumber('');
      setBalance('0');
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (paymentType === 'wallet') {
      if (!walletName.trim()) newErrors.walletName = 'Wallet name is required';
      if (!accountName.trim()) newErrors.accountName = 'Account name is required';
      if (!accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
    }

    if (paymentType === 'bank') {
      if (!bankName.trim()) newErrors.bankName = 'Bank name is required';
      if (!accountName.trim()) newErrors.accountName = 'Account name is required';
      if (!accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
    }

    if ((paymentType === 'cash' || paymentType === 'bank' || paymentType === 'wallet') && balance) {
      if (isNaN(Number(balance)) || Number(balance) < 0) {
        newErrors.balance = 'Balance must be a valid positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    let payment: PaymentMedium;

    switch (paymentType) {
      case 'cash':
        payment = { 
          type: 'cash',
          balance: Number(balance) || 0
        };
        break;
      case 'wallet':
        payment = {
          type: 'wallet',
          walletName,
          accountName,
          accountNumber,
          balance: Number(balance) || 0
        };
        break;
      case 'bank':
        payment = {
          type: 'bank',
          bankName,
          accountName,
          accountNumber,
          balance: Number(balance) || 0
        };
        break;
      case 'cheque':
        payment = {
          type: 'cheque'
        };
        break;
      default:
        return;
    }

    onSave(payment);
    onClose();
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {initialData ? 'Edit Payment Method' : 'Add Payment Method'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {initialData ? 'Update payment method details' : 'Add a new payment method to your account'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="action-btn"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-6">
            <div>
              <label className="form-label">Payment Type</label>
              <select
                className="form-input"
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                disabled={!!initialData && (initialData.type === 'cash' || initialData.type === 'cheque')}
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank Account</option>
                <option value="wallet">E-Wallet</option>
                <option value="cheque">Cheque</option>
              </select>
              {initialData && (initialData.type === 'cash' || initialData.type === 'cheque') && (
                <p className="mt-2 text-sm text-gray-500">
                  Cannot change type for default payment methods
                </p>
              )}
            </div>

            {paymentType === 'wallet' && (
              <>
                <div>
                  <label className="form-label">Wallet Name</label>
                  <input
                    type="text"
                    className={`form-input ${errors.walletName ? 'error' : ''}`}
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    placeholder="e.g., PayPal, Venmo, Apple Pay"
                  />
                  {errors.walletName && (
                    <p className="mt-2 text-sm text-red-600">{errors.walletName}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Account Name</label>
                  <input
                    type="text"
                    className={`form-input ${errors.accountName ? 'error' : ''}`}
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Account holder name"
                  />
                  {errors.accountName && (
                    <p className="mt-2 text-sm text-red-600">{errors.accountName}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Account Number/ID</label>
                  <input
                    type="text"
                    className={`form-input ${errors.accountNumber ? 'error' : ''}`}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Account number or ID"
                  />
                  {errors.accountNumber && (
                    <p className="mt-2 text-sm text-red-600">{errors.accountNumber}</p>
                  )}
                </div>
              </>
            )}

            {paymentType === 'bank' && (
              <>
                <div>
                  <label className="form-label">Bank Name</label>
                  <input
                    type="text"
                    className={`form-input ${errors.bankName ? 'error' : ''}`}
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g., Chase, Bank of America"
                  />
                  {errors.bankName && (
                    <p className="mt-2 text-sm text-red-600">{errors.bankName}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Account Name</label>
                  <input
                    type="text"
                    className={`form-input ${errors.accountName ? 'error' : ''}`}
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Account holder name"
                  />
                  {errors.accountName && (
                    <p className="mt-2 text-sm text-red-600">{errors.accountName}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Account Number</label>
                  <input
                    type="text"
                    className={`form-input ${errors.accountNumber ? 'error' : ''}`}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Bank account number"
                  />
                  {errors.accountNumber && (
                    <p className="mt-2 text-sm text-red-600">{errors.accountNumber}</p>
                  )}
                </div>
              </>
            )}

            {(paymentType === 'cash' || paymentType === 'bank' || paymentType === 'wallet') && (
              <div>
                <label className="form-label">Current Balance</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="text"
                    className={`form-input pl-8 ${errors.balance ? 'error' : ''}`}
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                {errors.balance && (
                  <p className="mt-2 text-sm text-red-600">{errors.balance}</p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  Enter the current balance for this payment method
                </p>
              </div>
            )}

            {paymentType === 'cheque' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  Cheque payments don't require additional setup. This method will be available for receipt transactions.
                </p>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              <Save size={18} />
              {initialData ? 'Update Method' : 'Add Method'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentMediumModal;