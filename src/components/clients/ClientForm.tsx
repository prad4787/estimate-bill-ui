import React, { useState, useEffect } from 'react';
import { ClientFormData, Client } from '../../types';

interface ClientFormProps {
  initialData?: Client;
  onSubmit: (data: ClientFormData) => void;
  isSubmitting: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({ 
  initialData, 
  onSubmit, 
  isSubmitting 
}) => {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    address: '',
    panVat: '',
    openingBalance: '0',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        address: initialData.address || '',
        panVat: initialData.panVat || '',
        openingBalance: initialData.openingBalance.toString(),
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required';
    }
    
    if (formData.openingBalance && isNaN(Number(formData.openingBalance))) {
      newErrors.openingBalance = 'Opening balance must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            className={`form-input ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter client name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
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
            className="form-input border-gray-300"
            placeholder="Enter PAN/VAT number (optional)"
          />
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="address" className="form-label">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="form-input border-gray-300"
            placeholder="Enter client address (optional)"
          />
        </div>
        
        <div>
          <label htmlFor="openingBalance" className="form-label">
            Opening Balance
          </label>
          <input
            type="text"
            id="openingBalance"
            name="openingBalance"
            value={formData.openingBalance}
            onChange={handleChange}
            className={`form-input ${errors.openingBalance ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter opening balance"
          />
          {errors.openingBalance && (
            <p className="mt-1 text-sm text-red-500">{errors.openingBalance}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Enter the initial balance for this client. Default is 0.
          </p>
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="btn btn-outline"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Client' : 'Add Client'}
        </button>
      </div>
    </form>
  );
};

export default ClientForm;