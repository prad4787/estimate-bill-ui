import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
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
    <div className="space-y-6">
      <div>
        <button 
          onClick={() => navigate('/clients')}
          className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Clients
        </button>
        <h1>Add New Client</h1>
      </div>
      
      <div className="card p-6">
        <ClientForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default AddClient;