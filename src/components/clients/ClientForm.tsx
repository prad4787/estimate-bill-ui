import React, { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import { ClientFormData, Client } from "../../types";

interface ClientFormProps {
  initialData?: Client;
  onSubmit: (data: ClientFormData) => void;
  isSubmitting: boolean;
  externalErrors?: Record<string, string>;
}

const ClientForm: React.FC<ClientFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  externalErrors,
}) => {
  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
    address: "",
    panVat: "",
    openingBalance: "0",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        address: initialData.address || "",
        panVat: initialData.panVat || "",
        openingBalance: initialData.openingBalance.toString(),
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (externalErrors) {
      setErrors((prev) => ({ ...prev, ...externalErrors }));
    }
  }, [externalErrors]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Client name is required";
    }

    if (formData.openingBalance && isNaN(Number(formData.openingBalance))) {
      newErrors.openingBalance = "Opening balance must be a number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  console.log({ errors: errors.panVat });

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="form-label">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? "error" : ""}`}
              placeholder="Enter client name"
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <X size={14} className="mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="panVat" className="form-label">
              PAN/VAT Number
            </label>
            <input
              type="text"
              id="panVat"
              name="panVat"
              value={formData.panVat}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter PAN/VAT number (optional)"
            />
            {errors.panVat && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <X size={14} className="mr-1" />
                {errors.panVat}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Tax identification number for business clients
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="address" className="form-label">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={4}
              className="form-input"
              placeholder="Enter client address (optional)"
            />
            <p className="mt-2 text-sm text-gray-500">
              Complete business or residential address
            </p>
          </div>

          <div>
            <label htmlFor="openingBalance" className="form-label">
              Opening Balance
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="text"
                id="openingBalance"
                name="openingBalance"
                value={formData.openingBalance}
                onChange={handleChange}
                className={`form-input pl-8 ${
                  errors.openingBalance ? "error" : ""
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.openingBalance && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <X size={14} className="mr-1" />
                {errors.openingBalance}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Initial balance for this client account. Default is $0.00
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
              {initialData ? "Update Client" : "Add Client"}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ClientForm;
