import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { useClientStore } from "../../store/clientStore";
import { ClientFormData } from "../../types";
import ClientForm from "../../components/clients/ClientForm";

const EditClient: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getClient,
    updateClient,
    currentClient,
    currentClientLoading,
    currentClientError,
  } = useClientStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClient = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);
        await getClient(id);
      } catch (err) {
        setError("Failed to load client data");
        console.error("Error loading client:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadClient();
  }, [id, getClient]);

  const validateForm = (formData: ClientFormData): string | null => {
    if (!formData.name.trim()) {
      return "Client name is required";
    }

    if (formData.openingBalance && isNaN(parseFloat(formData.openingBalance))) {
      return "Opening balance must be a valid number";
    }

    return null;
  };

  const handleSubmit = async (formData: ClientFormData) => {
    if (!id) return;

    const validationError = validateForm(formData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateClient(id, {
        name: formData.name.trim(),
        address: formData.address?.trim() || undefined,
        panVat: formData.panVat?.trim() || undefined,
        openingBalance: parseFloat(formData.openingBalance) || 0,
      });

      toast.success("Client updated successfully");
      navigate("/clients");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update client";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error updating client:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || currentClientLoading) {
    return (
      <div className="space-y-6">
        <div>
          <button
            onClick={() => navigate("/clients")}
            className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Clients
          </button>
          <h1>Edit Client</h1>
        </div>

        <div className="card p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading client data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentClient || currentClientError) {
    return (
      <div className="space-y-6">
        <div>
          <button
            onClick={() => navigate("/clients")}
            className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Clients
          </button>
          <h1>Edit Client</h1>
        </div>

        <div className="card p-6">
          <div className="text-center py-8">
            <h2 className="text-2xl font-medium mb-2">Client Not Found</h2>
            <p className="text-gray-500 mb-6">
              {currentClientError ||
                "The client you're looking for doesn't exist or has been removed."}
            </p>
            <button
              onClick={() => navigate("/clients")}
              className="btn btn-primary"
            >
              Back to Clients
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate("/clients")}
          className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Clients
        </button>
        <h1>Edit Client</h1>
      </div>

      <div className="card p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <ClientForm
          initialData={currentClient}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default EditClient;
