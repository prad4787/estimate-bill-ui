import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { usePaymentMethodStore } from "../../store/paymentMethodStore";
import { PaymentMethodFormData } from "../../types";
import PaymentMethodForm from "../../components/payment/PaymentMethodForm";

const AddPaymentMethod: React.FC = () => {
  const navigate = useNavigate();
  const { addPaymentMethod } = usePaymentMethodStore();

  const handleSubmit = async (data: PaymentMethodFormData) => {
    try {
      const balance = Number(data.balance) || 0;
      await addPaymentMethod({
        ...data,
        balance: balance.toString(),
      });
      toast.success("Payment method added successfully");
      navigate("/payments");
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast.error("Failed to add payment method");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Add Payment Method</h1>
          <p className="text-gray-600 mt-2">
            Add a new payment method to your account.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <PaymentMethodForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default AddPaymentMethod;
