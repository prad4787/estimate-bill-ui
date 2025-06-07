import React, { useState } from 'react';
import { Plus, CreditCard } from 'lucide-react';
import PaymentMediumModal from '../../components/payment/PaymentMediumModal';
import { PaymentMedium } from '../../types';
import EmptyState from '../../components/ui/EmptyState';

const PaymentMethodList: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMedium[]>([]);

  const handleSave = (payment: PaymentMedium) => {
    setPaymentMethods([...paymentMethods, payment]);
    setShowModal(false);
  };

  const renderPaymentDetails = (payment: PaymentMedium) => {
    switch (payment.type) {
      case 'cash':
        return 'Cash Payment';
      case 'wallet':
        return (
          <>
            <p className="font-medium">{payment.walletName}</p>
            <p className="text-sm text-gray-500">
              {payment.accountName} • {payment.accountNumber}
            </p>
          </>
        );
      case 'bank':
        return (
          <>
            <p className="font-medium">{payment.bankName}</p>
            <p className="text-sm text-gray-500">
              {payment.accountName} • {payment.accountNumber}
            </p>
          </>
        );
      case 'cheque':
        return (
          <p className="font-medium">
            Cheque (Exchange: {new Date(payment.exchangeDate).toLocaleDateString()})
          </p>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1>Payment Methods</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary inline-flex items-center"
        >
          <Plus size={16} className="mr-1" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paymentMethods.map((method, index) => (
            <div key={index} className="card p-4">
              {renderPaymentDetails(method)}
            </div>
          ))}
        </div>
      )}

      <PaymentMediumModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />
    </div>
  );
}

export default PaymentMethodList