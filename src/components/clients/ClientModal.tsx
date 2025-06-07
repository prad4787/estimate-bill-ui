import React, { useState } from 'react';
import { X, UserPlus, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useClientStore } from '../../store/clientStore';
import { ClientFormData, Client } from '../../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated?: (client: Client) => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, onClientCreated }) => {
  const { addClient } = useClientStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    address: '',
    panVat: '',
    openingBalance: '0',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const clientId = addClient({
        name: formData.name,
        address: formData.address || undefined,
        panVat: formData.panVat || undefined,
        openingBalance: parseFloat(formData.openingBalance) || 0,
      });
      
      // Get the created client
      const createdClient = {
        id: clientId,
        name: formData.name,
        address: formData.address || undefined,
        panVat: formData.panVat || undefined,
        openingBalance: parseFloat(formData.openingBalance) || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      toast.success('Client created successfully');
      
      // Reset form
      setFormData({
        name: '',
        address: '',
        panVat: '',
        openingBalance: '0',
      });
      setErrors({});
      
      // Notify parent component
      if (onClientCreated) {
        onClientCreated(createdClient);
      }
      
      onClose();
    } catch (error) {
      toast.error('Failed to create client');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      address: '',
      panVat: '',
      openingBalance: '0',
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Client</h2>
              <p className="text-sm text-gray-600">Create a new client profile</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="action-btn"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="modal-name" className="form-label">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="modal-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Enter client name"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <X size={14} className="mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="modal-panVat" className="form-label">
                  PAN/VAT Number
                </label>
                <input
                  type="text"
                  id="modal-panVat"
                  name="panVat"
                  value={formData.panVat}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter PAN/VAT number"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="modal-address" className="form-label">
                Address
              </label>
              <textarea
                id="modal-address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="form-input"
                placeholder="Enter client address"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label htmlFor="modal-openingBalance" className="form-label">
                Opening Balance
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="text"
                  id="modal-openingBalance"
                  name="openingBalance"
                  value={formData.openingBalance}
                  onChange={handleChange}
                  className={`form-input pl-8 ${errors.openingBalance ? 'error' : ''}`}
                  placeholder="0.00"
                  disabled={isSubmitting}
                />
              </div>
              {errors.openingBalance && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <X size={14} className="mr-1" />
                  {errors.openingBalance}
                </p>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={handleClose}
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
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Create Client
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;