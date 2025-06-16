import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useReceiptStore } from "../../store/receiptStore";
import { useClientStore } from "../../store/clientStore";
import { Transaction, Client, PaymentType, PaymentMethod } from "../../types";
import ClientModal from "../../components/clients/ClientModal";
import ClientSelect from "../../components/clients/ClientSelect";

const AddReceipt: React.FC = () => {
  const navigate = useNavigate();
  const { addReceipt } = useReceiptStore();
  const { clients, fetchClients } = useClientStore();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [transactions, setTransactions] = useState<
    Omit<
      Transaction,
      "id" | "receiptId" | "createdAt" | "updatedAt" | "paymentMethod"
    >[]
  >([
    {
      amount: 0,
      paymentType: "cash",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<
    PaymentMethod[]
  >([]);
  const [showClientModal, setShowClientModal] = useState(false);

  useEffect(() => {
    fetchClients();
    // Load saved payment methods from localStorage
    const methods = localStorage.getItem("billmanager-payment-methods");
    if (methods) {
      setSavedPaymentMethods(JSON.parse(methods));
    }
  }, [fetchClients]);

  const handleClientCreated = (newClient: Client) => {
    console.log({ newClient });
    setSelectedClient(newClient);
    setShowClientModal(false);
    fetchClients();
  };

  const handleTransactionChange = (
    index: number,
    field: keyof Transaction | "chequeDetails",
    value: string | number | PaymentType | { [key: string]: string }
  ) => {
    const newTransactions = [...transactions];
    if (field === "chequeDetails") {
      const chequeDetails = value as { [key: string]: string };
      // Ensure all required fields are present
      if (
        chequeDetails.bankName &&
        chequeDetails.chequeNumber &&
        chequeDetails.branchName &&
        chequeDetails.issueDate
      ) {
        newTransactions[index] = {
          ...newTransactions[index],
          chequeDetails: {
            bankName: chequeDetails.bankName,
            chequeNumber: chequeDetails.chequeNumber,
            branchName: chequeDetails.branchName,
            issueDate: chequeDetails.issueDate,
          },
        };
      }
    } else {
      newTransactions[index] = {
        ...newTransactions[index],
        [field]: field === "paymentMethodId" ? Number(value) : value,
      };

      // Reset payment method and cheque details when payment type changes
      if (field === "paymentType") {
        delete newTransactions[index].paymentMethodId;
        delete newTransactions[index].chequeDetails;
      }
    }
    setTransactions(newTransactions);
  };

  const addTransaction = () => {
    setTransactions([
      ...transactions,
      {
        amount: 0,
        paymentType: "cash",
      },
    ]);
  };

  const removeTransaction = (index: number) => {
    if (transactions.length > 1) {
      setTransactions(transactions.filter((_, i) => i !== index));
    }
  };

  const getRelevantMethods = (paymentType: PaymentType): PaymentMethod[] => {
    return savedPaymentMethods.filter((method) => method.type === paymentType);
  };

  const formatPaymentMethodDisplay = (method: PaymentMethod): string => {
    switch (method.type) {
      case "bank":
        return `${method.name} - ${method.accountName} (${method.accountNumber})`;
      case "wallet":
        return `${method.name} - ${method.accountName} (${method.accountNumber})`;
      case "cash":
        return "Cash";
      default:
        return "Payment Method";
    }
  };

  const renderPaymentMethodSelector = (
    transaction: Omit<
      Transaction,
      "id" | "receiptId" | "createdAt" | "updatedAt" | "paymentMethod"
    >,
    index: number
  ) => {
    if (transaction.paymentType === "cash") {
      return null;
    }

    if (transaction.paymentType === "cheque") {
      return (
        <div className="space-y-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <h3 className="text-sm font-semibold text-yellow-800">
            Cheque Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Bank Name</label>
              <input
                type="text"
                className="form-input"
                value={transaction.chequeDetails?.bankName || ""}
                onChange={(e) =>
                  handleTransactionChange(index, "chequeDetails", {
                    ...transaction.chequeDetails,
                    bankName: e.target.value,
                  })
                }
                placeholder="Enter bank name"
                required
              />
            </div>
            <div>
              <label className="form-label">Cheque Number</label>
              <input
                type="text"
                className="form-input"
                value={transaction.chequeDetails?.chequeNumber || ""}
                onChange={(e) =>
                  handleTransactionChange(index, "chequeDetails", {
                    ...transaction.chequeDetails,
                    chequeNumber: e.target.value,
                  })
                }
                placeholder="Enter cheque number"
                required
              />
            </div>
            <div>
              <label className="form-label">Branch Name</label>
              <input
                type="text"
                className="form-input"
                value={transaction.chequeDetails?.branchName || ""}
                onChange={(e) =>
                  handleTransactionChange(index, "chequeDetails", {
                    ...transaction.chequeDetails,
                    branchName: e.target.value,
                  })
                }
                placeholder="Enter branch name"
                required
              />
            </div>
            <div>
              <label className="form-label">Issue Date</label>
              <input
                type="date"
                className="form-input"
                value={transaction.chequeDetails?.issueDate || ""}
                onChange={(e) =>
                  handleTransactionChange(index, "chequeDetails", {
                    ...transaction.chequeDetails,
                    issueDate: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>
        </div>
      );
    }

    // For bank and wallet transactions
    const relevantMethods = getRelevantMethods(transaction.paymentType);

    if (relevantMethods.length === 0) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-800 mb-3">
            No {transaction.paymentType} accounts found. Please add a{" "}
            {transaction.paymentType} account first.
          </p>
          <button
            type="button"
            onClick={() => navigate("/payments")}
            className="btn btn-outline btn-sm"
          >
            Manage Payment Methods
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <label className="form-label">
          Select{" "}
          {transaction.paymentType === "bank" ? "Bank Account" : "E-Wallet"}
        </label>
        <div className="space-y-2">
          {relevantMethods.map((method) => (
            <div
              key={method.id}
              className={`p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                transaction.paymentMethodId === method.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() =>
                handleTransactionChange(index, "paymentMethodId", method.id)
              }
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-900">
                    {formatPaymentMethodDisplay(method)}
                  </div>
                  {method.balance !== undefined && (
                    <div className="text-xs text-gray-500 mt-1">
                      Balance: ${method.balance.toFixed(2)}
                    </div>
                  )}
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    transaction.paymentMethodId === method.id
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {transaction.paymentMethodId === method.id && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {transaction.paymentMethodId && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
            <div className="text-sm text-green-800">
              <strong>Selected:</strong>{" "}
              {formatPaymentMethodDisplay(
                relevantMethods.find(
                  (m) => m.id === transaction.paymentMethodId
                )!
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient) {
      toast.error("Please select a client");
      return;
    }

    if (transactions.some((t) => t.amount <= 0)) {
      toast.error("All transaction amounts must be greater than 0");
      return;
    }

    // Validate required fields for cheque transactions
    const invalidCheque = transactions.some(
      (t) =>
        t.paymentType === "cheque" &&
        (!t.chequeDetails?.bankName ||
          !t.chequeDetails?.chequeNumber ||
          !t.chequeDetails?.branchName ||
          !t.chequeDetails?.issueDate)
    );

    if (invalidCheque) {
      toast.error("Please fill in all cheque details");
      return;
    }

    // Validate payment methods for bank and wallet transactions
    const invalidPaymentMethod = transactions.some(
      (t) =>
        (t.paymentType === "bank" || t.paymentType === "wallet") &&
        !t.paymentMethodId
    );

    if (invalidPaymentMethod) {
      toast.error("Please select payment methods for bank/wallet transactions");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Receipt created successfully", {
        date,
        clientId: selectedClient,
        transactions: transactions.map((t) => ({
          ...t,
          amount: Number(t.amount),
          paymentMethodId: t.paymentMethodId
            ? Number(t.paymentMethodId)
            : undefined,
        })),
      });

      await addReceipt({
        date,
        clientId: selectedClient.id,
        transactions: transactions.map((t) => ({
          ...t,
          amount: Number(t.amount),
          paymentMethodId: t.paymentMethodId
            ? Number(t.paymentMethodId)
            : undefined,
        })),
      });

      toast.success("Receipt created successfully");
      navigate("/receipts");
    } catch (error) {
      toast.error("Failed to create receipt");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalAmount = () => {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <button
          onClick={() => navigate("/receipts")}
          className="inline-flex items-center text-gray-600 mb-6"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Receipts
        </button>
        <div className="page-header">
          <div>
            <h1 className="page-title">Create Receipt</h1>
            <p className="text-gray-600 mt-2">
              Record payment transactions from your clients.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">
              Receipt Information
            </h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <ClientSelect
                  clients={clients}
                  selectedClient={selectedClient}
                  setSelectedClient={setSelectedClient}
                  onClientCreated={handleClientCreated}
                />
              </div>
            </div>
          </div>

          <div className="card-header">
            <div className="flex justify-between items-center">
              <h5 className="text-xl font-semibold text-gray-900">
                Transactions
              </h5>
              <div className="text-xl font-bold text-green-600">
                Total: ${getTotalAmount().toFixed(2)}
              </div>
            </div>
          </div>
          <div className="card-body space-y-6">
            {transactions.map((transaction, index) => (
              <div
                key={index}
                className="relative card border-l-4 border-l-green-500"
              >
                {transactions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTransaction(index)}
                    className="absolute top-4 right-4 action-btn action-btn-danger"
                    title="Remove transaction"
                  >
                    <Trash2 size={18} />
                  </button>
                )}

                <div className="card-body space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Amount ($)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          className="form-input pl-8"
                          value={transaction.amount || ""}
                          onChange={(e) =>
                            handleTransactionChange(
                              index,
                              "amount",
                              Number(e.target.value)
                            )
                          }
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Payment Type</label>
                      <select
                        className="form-input"
                        value={transaction.paymentType}
                        onChange={(e) =>
                          handleTransactionChange(
                            index,
                            "paymentType",
                            e.target.value as PaymentType
                          )
                        }
                      >
                        <option value="cash">Cash</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="wallet">E-Wallet</option>
                        <option value="cheque">Cheque</option>
                      </select>
                    </div>
                  </div>

                  {(transaction.paymentType === "bank" ||
                    transaction.paymentType === "wallet" ||
                    transaction.paymentType === "cheque") && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      {renderPaymentMethodSelector(transaction, index)}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addTransaction}
              className="btn btn-outline w-full"
            >
              <Plus size={18} />
              Add Another Transaction
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/receipts")}
            className="btn btn-outline"
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
              "Create Receipt"
            )}
          </button>
        </div>
      </form>

      <ClientModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onClientCreated={handleClientCreated}
      />
    </div>
  );
};

export default AddReceipt;
