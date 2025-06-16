import React from "react";
import { X, Save } from "lucide-react";
import { PaymentMethod, PaymentMethodFormData } from "../../types";
import { Form } from "../form/Form";
import LoadingSpinner from "../ui/LoadingSpinner";

interface PaymentMethodFormProps {
  initialData?: PaymentMethod;
  onSubmit: (data: PaymentMethodFormData) => void;
  onCancel: () => void;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const initialValues: PaymentMethodFormData = {
    type: initialData?.type || "cash",
    name: initialData?.name || "",
    accountName: initialData?.accountName || "",
    accountNumber: initialData?.accountNumber || "",
    balance: initialData?.balance?.toString() || "0.00",
  };

  const validateForm = (
    values: PaymentMethodFormData
  ): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!values.name?.trim()) {
      errors.name = "Name is required";
    }

    // Only validate account details for bank and wallet types
    if (values.type === "bank" || values.type === "wallet") {
      if (!values.accountName?.trim()) {
        errors.accountName = "Account name is required";
      }
      if (!values.accountNumber?.trim()) {
        errors.accountNumber = "Account number is required";
      }
    }

    if (values.balance) {
      const balanceNum = parseFloat(values.balance);
      if (isNaN(balanceNum)) {
        errors.balance = "Invalid balance amount";
      }
    }

    return errors;
  };

  return (
    <Form<PaymentMethodFormData>
      initialValues={initialValues}
      validate={validateForm}
      onSubmit={onSubmit}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        isSubmitting,
      }) => (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="type" className="form-label">
                  Payment Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={values.type}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${
                    errors.type && touched.type ? "error" : ""
                  }`}
                  disabled={!!initialData && initialData.type === "cash"}
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Account</option>
                  <option value="wallet">E-Wallet</option>
                </select>
                {errors.type && touched.type && (
                  <p className="form-error">
                    <X size={14} className="mr-1.5" />
                    {errors.type}
                  </p>
                )}
                {initialData && initialData.type === "cash" && (
                  <p className="form-helper">
                    Cannot change type for default payment methods
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="name" className="form-label">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${
                    errors.name && touched.name ? "error" : ""
                  }`}
                  placeholder="Enter payment method name"
                />
                {errors.name && touched.name && (
                  <p className="form-error">
                    <X size={14} className="mr-1.5" />
                    {errors.name}
                  </p>
                )}
              </div>

              {(values.type === "bank" || values.type === "wallet") && (
                <>
                  <div>
                    <label htmlFor="accountName" className="form-label">
                      Account Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="accountName"
                      name="accountName"
                      value={values.accountName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-input ${
                        errors.accountName && touched.accountName ? "error" : ""
                      }`}
                      placeholder="Enter account holder name"
                    />
                    {errors.accountName && touched.accountName && (
                      <p className="form-error">
                        <X size={14} className="mr-1.5" />
                        {errors.accountName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="accountNumber" className="form-label">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="accountNumber"
                      name="accountNumber"
                      value={values.accountNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-input ${
                        errors.accountNumber && touched.accountNumber
                          ? "error"
                          : ""
                      }`}
                      placeholder="Enter account number"
                    />
                    {errors.accountNumber && touched.accountNumber && (
                      <p className="form-error">
                        <X size={14} className="mr-1.5" />
                        {errors.accountNumber}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="space-y-6">
              {(values.type === "cash" ||
                values.type === "bank" ||
                values.type === "wallet") && (
                <div>
                  <label htmlFor="balance" className="form-label">
                    Current Balance
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted">
                      $
                    </span>
                    <input
                      type="text"
                      id="balance"
                      name="balance"
                      value={values.balance}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-input pl-8 ${
                        errors.balance && touched.balance ? "error" : ""
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.balance && touched.balance && (
                    <p className="form-error">
                      <X size={14} className="mr-1.5" />
                      {errors.balance}
                    </p>
                  )}
                  <p className="form-helper">
                    Enter the current balance for this payment method
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
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
                  <div className="w-4 h-4">
                    <LoadingSpinner />
                  </div>
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} className="mr-1.5" />
                  {initialData ? "Update Method" : "Add Method"}
                </>
              )}
            </button>
          </div>
        </>
      )}
    </Form>
  );
};

export default PaymentMethodForm;
