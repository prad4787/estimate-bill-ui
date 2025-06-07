import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PaymentType, PaymentMedium } from '../../types';

interface PaymentMediumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: PaymentMedium) => void;
}

const PaymentMediumModal: React.FC<PaymentMediumModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [paymentType, setPaymentType] = useState<PaymentType>('cash');
  const [walletName, setWalletName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [exchangeDate, setExchangeDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let payment: PaymentMedium;

    switch (paymentType) {
      case 'cash':
        payment = { type: 'cash' };
        break;
      case 'wallet':
        payment = {
          type: 'wallet',
          walletName,
          accountName,
          accountNumber,
        };
        break;
      case 'bank':
        payment = {
          type: 'bank',
          bankName,
          accountName,
          accountNumber,
        };
        break;
      case 'cheque':
        payment = {
          type: 'cheque',
          exchangeDate,
        };
        break;
      default:
        return;
    }

    onSave(payment);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Payment Medium</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="form-label">Payment Type</label>
            <select
              className="form-input"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as PaymentType)}
            >
              <option value="cash">Cash</option>
              <option value="wallet">Wallet</option>
              <option value="bank">Bank</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          {paymentType === 'wallet' && (
            <>
              <div>
                <label className="form-label">Wallet Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label">Account Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label">Account Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {paymentType === 'bank' && (
            <>
              <div>
                <label className="form-label">Bank Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label">Account Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label">Account Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {paymentType === 'cheque' && (
            <div>
              <label className="form-label">Exchange Date</label>
              <input
                type="date"
                className="form-input"
                value={exchangeDate}
                onChange={(e) => setExchangeDate(e.target.value)}
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentMediumModal;