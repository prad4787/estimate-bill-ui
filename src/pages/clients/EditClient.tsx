import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { useClientStore } from '../../store/clientStore';
import { ClientFormData } from '../../types';
import ClientForm from '../../components/clients/ClientForm';

const EditClient: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClient, updateClient, fetchClients } = useClientStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);
  
  const client = id ? getClient(id) : undefined;
  
  useEffect(() => {
    if (id && !client) {
      setNotFound(true);
    }
  }, [id, client]);
  
  const handleSubmit = (formData: ClientFormData) => {
    if (!id) return;
    
    setIsSubmitting(true);
    
    try {
      updateClient(id, {
        name: formData.name,
        address: formData.address || undefined,
        panVat: formData.panVat || undefined,
        openingBalance: parseFloat(formData.openingBalance) || 0,
      });
      
      toast.success('Client updated successfully');
      navigate('/clients');
    } catch (error) {
      toast.error('Failed to update client');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (notFound) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-medium mb-2">Client Not Found</h2>
        <p className="text-gray-500 mb-6">The client you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/clients')}
          className="btn btn-primary"
        >
          Back to Clients
        </button>
      </div>
    );
  }
  
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
        <h1>Edit Client</h1>
      </div>
      
      <div className="card p-6">
        {client ? (
          <ClientForm
            initialData={client}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading client data...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditClient;