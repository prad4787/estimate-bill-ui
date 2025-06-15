import React, { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import { StockFormData, Stock } from "../../types";

interface StockFormProps {
  initialData?: Stock;
  onSubmit: (data: StockFormData) => void;
  isSubmitting: boolean;
}

const StockForm: React.FC<StockFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<StockFormData>({
    name: "",
    quantity: "",
    status: "tracked",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        quantity: initialData.quantity?.toString() || "",
        status: initialData.status,
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Stock name is required";
    }

    if (formData.quantity && isNaN(Number(formData.quantity))) {
      newErrors.quantity = "Quantity must be a number";
    }

    if (formData.quantity && Number(formData.quantity) < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="form-label">
              Stock Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? "error" : ""}`}
              placeholder="Enter stock item name"
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <X size={14} className="mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-input"
              disabled={!formData.quantity}
            >
              <option value="tracked">Tracked</option>
              <option value="untracked">Untracked</option>
            </select>
            {!formData.quantity && (
              <p className="mt-2 text-sm text-gray-500">
                Status will be automatically set to "Untracked" when quantity is
                empty
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="quantity" className="form-label">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className={`form-input ${errors.quantity ? "error" : ""}`}
              placeholder="Enter quantity (optional)"
              min="0"
              step="0.01"
            />
            {errors.quantity && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <X size={14} className="mr-1" />
                {errors.quantity}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Leave empty if quantity is not tracked for this item
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="btn btn-outline"
          disabled={isSubmitting}
        >
          <X size={18} />
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
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              {initialData ? "Update Stock" : "Add Stock"}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default StockForm;
