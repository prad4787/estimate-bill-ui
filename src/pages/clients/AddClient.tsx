import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useClientStore } from '../../store/clientStore';
import { ClientFormData } from '../../types';
import ClientForm from '../../components/clients/ClientForm';

const AddClient: React.FC = () => {
  const navigate = useNavigate();
  const { addClient } = useClientStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (formData: ClientFormData) => {
    setIsSubmitting(true);
    
    try {
      addClient({
        name: formData.name,
        address: formData.address || undefined,
        panVat: formData.panVat || undefined,
        openingBalance: parseFloat(formData.openingBalance) || 0,
      });
      
      toast.success('Client added successfully');
      navigate('/clients');
    } catch (error) {
      toast.error('Failed to add client');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <button 
          onClick={() => navigate('/clients')}
          className="inline-flex items-center text-gray-600 mb-6"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Clients
        </button>
        <div className="page-header">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg">
              <UserPlus size={24} />
            </div>
            <div>
              <h1 className="page-title">Add New Client</h1>
              <p className="text-gray-600 mt-2">Create a new client profile to start managing estimates and billing.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">Client Information</h2>
          <p className="text-gray-600 mt-1">Fill in the details below to add a new client to your system.</p>
        </div>
        <div className="card-body">
          <ClientForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default AddClient;