import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Package } from "lucide-react";
import { useStockStore } from "../../store/stockStore";
import { StockFormData } from "../../types";
import StockForm from "../../components/stock/StockForm";

const AddStock: React.FC = () => {
  const navigate = useNavigate();
  const { addStock } = useStockStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: StockFormData) => {
    setIsSubmitting(true);

    try {
      const quantity = formData.quantity ? parseFloat(formData.quantity) : null;
      const status =
        quantity === null ? "untracked" : formData.status || "tracked";

      await addStock({
        name: formData.name,
        quantity,
        status,
      });

      toast.success("Stock added successfully");
      navigate("/stock");
    } catch (error) {
      toast.error("Failed to add stock");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <button
          onClick={() => navigate("/stock")}
          className="inline-flex items-center text-gray-600 mb-6"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Stock
        </button>
        <div className="page-header">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg">
              <Package size={24} />
            </div>
            <div>
              <h1 className="page-title">Add New Stock</h1>
              <p className="text-gray-600 mt-2">
                Create a new stock item for inventory management.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">
            Stock Information
          </h2>
          <p className="text-gray-600 mt-1">
            Fill in the details below to add a new stock item to your inventory.
          </p>
        </div>
        <div className="card-body">
          <StockForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </div>
  );
};

export default AddStock;
