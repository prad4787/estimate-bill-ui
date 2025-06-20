import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Package } from "lucide-react";
import { useStockStore } from "../../store/stockStore";
import { Stock, StockFormData } from "../../types";
import StockForm from "../../components/stock/StockForm";

const EditStock: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getStock, updateStock } = useStockStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStock = async () => {
      if (!id) return;

      try {
        const stockData = await getStock(id);
        if (stockData) {
          setStock(stockData);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Failed to load stock:", error);
        toast.error("Failed to load stock data");
      } finally {
        setLoading(false);
      }
    };

    loadStock();
  }, [id, getStock]);

  const handleSubmit = async (formData: StockFormData) => {
    if (!id) return;

    setIsSubmitting(true);

    try {
      const quantity = formData.quantity ? parseFloat(formData.quantity) : null;
      const status =
        quantity === null ? "untracked" : formData.status || "tracked";

      const updatedStock = await updateStock(id, {
        name: formData.name,
        quantity,
        status,
      });

      if (updatedStock) {
        toast.success("Stock updated successfully");
        navigate("/stock");
      } else {
        toast.error("Failed to update stock");
      }
    } catch (error) {
      toast.error("Failed to update stock");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stock data...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-4">Stock Not Found</h2>
          <p className="text-gray-500 mb-8">
            The stock item you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/stock")}
            className="btn btn-primary"
          >
            Back to Stock
          </button>
        </div>
      </div>
    );
  }

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
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg">
              <Package size={24} />
            </div>
            <div>
              <h1 className="page-title">Edit Stock</h1>
              <p className="text-gray-600 mt-2">
                Update stock item information and quantity.
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
            Update the details below to modify the stock item.
          </p>
        </div>
        <div className="card-body">
          {stock ? (
            <StockForm
              initialData={stock}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading stock data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditStock;
