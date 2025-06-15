import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { usePaymentMethodStore } from "../../store/paymentMethodStore";
import { PaymentMethod, PaymentMethodFormData } from "../../types";
import PaymentMethodForm from "../../components/payment/PaymentMethodForm";
import EmptyState from "../../components/ui/EmptyState";
import { CreditCard } from "lucide-react";

const EditPaymentMethod: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getPaymentMethod, updatePaymentMethod } = usePaymentMethodStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPaymentMethod = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const method = await getPaymentMethod(id);
        if (method) {
          setPaymentMethod(method);
        } else {
          setError("Payment method not found");
        }
      } catch (error) {
        console.error("Error loading payment method:", error);
        setError("Failed to load payment method");
      } finally {
        setLoading(false);
      }
    };

    loadPaymentMethod();
  }, [id, getPaymentMethod]);

  const handleSubmit = async (data: PaymentMethodFormData) => {
    if (!id) return;

    try {
      const balance = Number(data.balance) || 0;
      await updatePaymentMethod(id, {
        ...data,
        balance: balance.toString(),
      });
      toast.success("Payment method updated successfully");
      navigate("/payments");
    } catch (error) {
      console.error("Error updating payment method:", error);
      toast.error("Failed to update payment method");
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment method...</p>
        </div>
      </div>
    );
  }

  if (error || !paymentMethod) {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <EmptyState
            title={error || "Payment method not found"}
            description="The payment method you're looking for doesn't exist or you don't have permission to view it."
            icon={<CreditCard size={64} />}
            action={
              <button
                onClick={() => navigate("/payments")}
                className="btn btn-primary"
              >
                Back to Payment Methods
              </button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Edit Payment Method</h1>
          <p className="text-gray-600 mt-2">
            Update payment method details and settings.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <PaymentMethodForm
            initialData={paymentMethod}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default EditPaymentMethod;
