import React from "react";
import { Save, X } from "lucide-react";
import { PaymentMethod, PaymentMethodFormData } from "../../types";
import { Form } from "../form/Form";

interface PaymentMethodFormProps {
  initialData?: PaymentMethod;
  onSubmit: (data: PaymentMethodFormData) => void;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const initialValues: PaymentMethodFormData = {
    type: initialData?.type || "bank",
    name: initialData?.name || "",
    accountName: initialData?.accountName || "",
    accountNumber: initialData?.accountNumber || "",
    balance: initialData?.balance?.toString() || "0",
    isDefault: initialData?.isDefault || false,
  };

  const validateForm = (values: PaymentMethodFormData) => {
    const errors: Record<string, string> = {};

    if (!values.name?.trim()) {
      errors.name = "Payment method name is required";
    }

    if (values.type === "bank" || values.type === "wallet") {
      if (!values.accountName?.trim()) {
        errors.accountName = "Account name is required";
      }
      if (!values.accountNumber?.trim()) {
        errors.accountNumber = "Account number is required";
      }
    }

    if (values.balance) {
      const balance = Number(values.balance);
      if (isNaN(balance)) {
        errors.balance = "Balance must be a valid number";
      } else if (balance < 0) {
        errors.balance = "Balance cannot be negative";
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
                  disabled={
                    !!initialData &&
                    (initialData.type === "cash" ||
                      initialData.type === "cheque")
                  }
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Account</option>
                  <option value="wallet">E-Wallet</option>
                  <option value="cheque">Cheque</option>
                </select>
                {errors.type && touched.type && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <X size={14} className="mr-1" />
                    {errors.type}
                  </p>
                )}
                {initialData &&
                  (initialData.type === "cash" ||
                    initialData.type === "cheque") && (
                    <p className="mt-2 text-sm text-gray-500">
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
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <X size={14} className="mr-1" />
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
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <X size={14} className="mr-1" />
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
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <X size={14} className="mr-1" />
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
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
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
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <X size={14} className="mr-1" />
                      {errors.balance}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    Enter the current balance for this payment method
                  </p>
                </div>
              )}

              {values.type === "cheque" && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800">
                    Cheque payments don't require additional setup. This method
                    will be available for receipt transactions.
                  </p>
                </div>
              )}

              {!initialData && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={values.isDefault}
                    onChange={handleChange}
                    className="form-checkbox h-4 w-4 text-primary-600"
                  />
                  <label
                    htmlFor="isDefault"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Set as default payment method
                  </label>
                </div>
              )}
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
                  {initialData ? "Update Payment Method" : "Add Payment Method"}
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
