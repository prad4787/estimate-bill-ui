import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useClientStore } from "../../store/clientStore";
import { ApiError, Client, ClientFormData } from "../../types";
import { Form } from "../../components/form/Form";
import FormField from "../../components/form/FormField";
import { validateClient } from "../../utils/validation";

const AddClient: React.FC = () => {
  const navigate = useNavigate();
  const { addClient } = useClientStore();

  const initialValues: ClientFormData = {
    name: "",
    address: "",
    panVat: "",
    openingBalance: "0",
  };

  const handleSubmit = async (values: ClientFormData) => {
    try {
      const result: Client = await addClient({
        name: values.name,
        address: values.address || undefined,
        panVat: values.panVat || undefined,
        openingBalance: parseFloat(values.openingBalance) || 0,
      });
      toast.success(`Client ${result.name} added successfully`);
      navigate("/clients");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message);
      // Errors will be handled by the form system if you wire up external error support
      // Optionally, you can set field errors here if you extend the Form component
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <button
          onClick={() => navigate("/clients")}
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
              <p className="text-gray-600 mt-2">
                Create a new client profile to start managing estimates and
                billing.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">
            Client Information
          </h2>
          <p className="text-gray-600 mt-1">
            Fill in the details below to add a new client to your system.
          </p>
        </div>
        <div className="card-body">
          <Form<ClientFormData>
            initialValues={initialValues}
            validate={validateClient}
            onSubmit={handleSubmit}
          >
            <FormField name="name" label="Client Name" required />
            <FormField name="panVat" label="PAN/VAT Number" />
            <FormField name="address" label="Address" as="textarea" />
            <FormField
              name="openingBalance"
              label="Opening Balance"
              type="number"
            />
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/clients")}
                className="btn btn-outline"
              >
                <ArrowLeft size={18} />
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <UserPlus size={18} />
                Add Client
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddClient;
