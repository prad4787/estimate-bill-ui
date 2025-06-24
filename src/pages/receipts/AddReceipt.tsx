import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useReceiptStore } from "../../store/receiptStore";
import { useClientStore } from "../../store/clientStore";
import { usePaymentMethodStore } from "../../store/paymentMethodStore";
import { Transaction, Client, PaymentType, PaymentMethod } from "../../types";
import ClientModal from "../../components/clients/ClientModal";
import ClientSelect from "../../components/clients/ClientSelect";
import SearchableSelect, {
  SelectOption,
} from "../../components/ui/SearchableSelect";

const PAYMENT_TYPE_ID_MAP: Record<string, number> = {
  cash: 1,
  bank: 2,
  wallet: 3,
  cheque: 4,
};

const AddReceipt: React.FC = () => {
  const navigate = useNavigate();
  const { addReceipt } = useReceiptStore();
  const { clients, fetchClients } = useClientStore();
  const { paymentMethods, fetchPaymentMethods } = usePaymentMethodStore();

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
  const [showClientModal, setShowClientModal] = useState(false);

  useEffect(() => {
    fetchClients();
    fetchPaymentMethods(1, 100);
  }, [fetchClients, fetchPaymentMethods]);

  const handleClientCreated = (newClient: Client) => {
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
    return paymentMethods.filter((method) => method.type === paymentType);
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
    const options: SelectOption[] = relevantMethods.map((method) => ({
      id: method.id.toString(),
      name: formatPaymentMethodDisplay(method),
      type: method.type,
      accountName: method.accountName,
      accountNumber: method.accountNumber,
      balance: method.balance,
      createdAt: method.createdAt,
      updatedAt: method.updatedAt,
      isDefault: method.isDefault,
    }));
    const selected =
      options.find((opt) => opt.id === String(transaction.paymentMethodId)) ||
      null;

    return (
      <div className="space-y-3">
        <label className="form-label">
          Select{" "}
          {transaction.paymentType === "bank" ? "Bank Account" : "E-Wallet"}
        </label>
        <SearchableSelect
          options={options}
          value={selected}
          onChange={(option) =>
            handleTransactionChange(
              index,
              "paymentMethodId",
              option ? Number(option.id) : ""
            )
          }
          placeholder={`Select a ${
            transaction.paymentType === "bank" ? "bank account" : "wallet"
          }...`}
          searchPlaceholder={`Search ${
            transaction.paymentType === "bank" ? "bank accounts" : "wallets"
          }...`}
          required
        />
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
      await addReceipt({
        date,
        clientId: selectedClient.id,
        transactions: transactions.map((t) => {
          const { paymentType, ...rest } = t;
          const tx = {
            ...rest,
            amount: Number(t.amount),
            paymentType: PAYMENT_TYPE_ID_MAP[paymentType],
          };
          if (
            t.paymentMethodId !== undefined &&
            (typeof t.paymentMethodId !== "string" ||
              t.paymentMethodId !== "") &&
            !isNaN(Number(t.paymentMethodId))
          ) {
            tx.paymentMethodId = Number(t.paymentMethodId);
          }
          return tx;
        }) as any,
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
