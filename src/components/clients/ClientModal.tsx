import React from "react";
import { X, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useClientStore } from "../../store/clientStore";
import { ClientFormData, Client, ApiError } from "../../types";
import { Form } from "../form/Form";
import FormField from "../form/FormField";
import { validateClient } from "../../utils/validation";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated?: (client: Client) => void;
}

const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onClientCreated,
}) => {
  const { addClient } = useClientStore();

  if (!isOpen) return null;

  const initialValues: ClientFormData = {
    name: "",
    address: "",
    panVat: "",
    openingBalance: "0",
  };

  const handleSubmit = async (values: ClientFormData) => {
    try {
      const client = await addClient({
        name: values.name,
        address: values.address || undefined,
        panVat: values.panVat || undefined,
        openingBalance: parseFloat(values.openingBalance) || 0,
      });
      toast.success("Client created successfully");
      if (onClientCreated) {
        onClientCreated(client);
      }
      onClose();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message);
      // Optionally, you can set field errors here if you extend the Form component
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Add New Client
              </h2>
              <p className="text-sm text-gray-600">
                Create a new client profile
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="action-btn">
            <X size={20} />
          </button>
        </div>

        <Form<ClientFormData>
          initialValues={initialValues}
          validate={validateClient}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <>
              <div className="modal-body space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField name="name" label="Client Name" required />
                  <FormField name="panVat" label="PAN/VAT Number" />
                </div>
                <FormField name="address" label="Address" as="textarea" />
                <FormField
                  name="openingBalance"
                  label="Opening Balance"
                  type="number"
                />
              </div>
              <div className="modal-footer flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleClose}
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
                      <UserPlus size={18} />
                      Add Client
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </Form>
      </div>
    </div>
  );
};

export default ClientModal;
