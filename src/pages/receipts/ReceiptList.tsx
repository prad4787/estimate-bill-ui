import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Receipt,
  Search,
  Printer,
  Edit2,
  Eye,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useReceiptStore } from "../../store/receiptStore";
import { useClientStore } from "../../store/clientStore";
import { useOrganizationStore } from "../../store/organizationStore";
import EmptyState from "../../components/ui/EmptyState";
import {
  Receipt as ReceiptType,
  Client,
  OrganizationInfo,
  Transaction,
} from "../../types";

const ReceiptList: React.FC = () => {
  const {
    receipts,
    loading,
    error: receiptError,
    pagination,
    fetchReceipts,
    deleteReceipt,
  } = useReceiptStore();
  const { clients, fetchClients } = useClientStore();
  const { organization, fetchOrganization } = useOrganizationStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchReceipts({ page: currentPage });
    fetchClients();
    fetchOrganization();
  }, [fetchReceipts, fetchClients, fetchOrganization, currentPage]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this receipt?")) {
      try {
        await deleteReceipt(id);
        toast.success("Receipt deleted successfully");
        // Refresh the current page
        fetchReceipts({ page: currentPage });
      } catch {
        toast.error("Failed to delete receipt");
      }
    }
  };

  const handlePrint = (receiptId: number) => {
    const receipt = receipts.find((r) => r.id === receiptId);
    const client = receipt
      ? clients.find((c) => c.id === receipt.clientId)
      : null;

    if (!receipt || !client || !organization) {
      toast.error("Receipt, client, or organization data not found");
      return;
    }

    // Create thermal printer formatted content
    const thermalContent = generateThermalReceipt(
      receipt,
      client,
      organization
    );

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(thermalContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const generateThermalReceipt = (
    receipt: ReceiptType,
    client: Client,
    org: OrganizationInfo
  ): string => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const formatCurrency = (amount: number) => {
      return `$${amount.toFixed(2)}`;
    };

    const formatPaymentType = (type: string) => {
      switch (type) {
        case "cash":
          return "CASH";
        case "bank":
          return "BANK TRANSFER";
        case "wallet":
          return "E-WALLET";
        case "cheque":
          return "CHEQUE";
        default:
          return type.toUpperCase();
      }
    };

    const getPaymentDetails = (transaction: Transaction) => {
      if (transaction.paymentType === "cash") {
        return "";
      }

      if (transaction.paymentType === "cheque" && transaction.chequeDetails) {
        return `Cheque No: ${transaction.chequeDetails.chequeNumber}`;
      }

      // For now, we'll just show the payment type since we don't have the payment method details
      return formatPaymentType(transaction.paymentType);
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Receipt ${receipt.id}</title>
    <style>
        @media print {
            @page {
                size: 58mm auto;
                margin: 0;
            }
            body {
                margin: 0;
                padding: 0;
            }
        }
        
        body {
            font-family: 'Courier New', 'Consolas', monospace;
            font-size: 11px;
            line-height: 1.1;
            width: 58mm;
            margin: 0 auto;
            padding: 2mm;
            background: white;
            color: black;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        .header {
            text-align: center;
            margin-bottom: 8px;
        }
        
        .company-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 1px;
            text-transform: uppercase;
        }
        
        .company-address {
            font-size: 9px;
            margin-bottom: 1px;
            line-height: 1.0;
        }
        
        .bill-title {
            font-size: 12px;
            font-weight: bold;
            margin: 8px 0 6px 0;
            text-align: center;
        }
        
        .order-info {
            margin-bottom: 6px;
            font-size: 10px;
        }
        
        .separator {
            border-bottom: 1px dashed #000;
            margin: 4px 0;
        }
        
        .item-line {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
            font-size: 10px;
        }
        
        .item-name {
            flex: 1;
            margin-right: 8px;
        }
        
        .item-price {
            text-align: right;
            min-width: 40px;
        }
        
        .item-qty {
            font-size: 9px;
            margin-left: 4px;
        }
        
        .total-section {
            margin-top: 6px;
            border-top: 1px dashed #000;
            padding-top: 4px;
        }
        
        .total-line {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 12px;
            margin: 2px 0;
        }
        
        .payment-section {
            margin-top: 6px;
            font-size: 10px;
        }
        
        .payment-line {
            display: flex;
            justify-content: space-between;
            margin: 1px 0;
        }
        
        .footer {
            text-align: right;
        }
        
        .thank-you {
            text-align: center;
            margin: 6px 0;
            font-size: 10px;
        }
        
        .timestamp {
            text-align: center;
            margin-top: 4px;
            font-size: 9px;
        }
        
        .center {
            text-align: center;
        }
        
        .right {
            text-align: right;
        }
        
        .bold {
            font-weight: bold;
        }
        
        .small {
            font-size: 9px;
        }
        
        .currency {
            text-align: center;
            margin: 4px 0;
            font-size: 9px;
        }
        
        .dine-section {
            text-align: center;
            margin: 4px 0;
            font-size: 10px;
        }
        
        .employee-info {
            font-size: 9px;
            margin: 2px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">${org.name}</div>
        <div class="company-address">${org.address}</div>
    </div>
    
    <div class="currency center">Receipt currency: US Dollars</div>
    
    <div class="bill-title">BILL</div>
    
    <div class="order-info">
        <div>Order: ${receipt.id} - ${
      formatDate(receipt.date).split(" ")[1]
    }</div>
        <div>Employee: ${client.name}</div>
        <div>POS: POS 1</div>
    </div>
    
    <div class="separator"></div>
    
    <div class="dine-section">
        <div>Dine in</div>
    </div>
    
    <div class="separator"></div>
    
    <div class="center small">
        <div>${client.name}</div>
    </div>
    
    <div class="separator"></div>
    
    ${receipt.transactions
      .map(
        (transaction: Transaction) => `
        <div class="item-line">
            <span class="item-name">${formatPaymentType(
              transaction.paymentType
            )} Payment</span>
            <span class="item-price">${formatCurrency(
              transaction.amount
            )}</span>
        </div>
        <div class="item-qty">1 x ${formatCurrency(transaction.amount)}</div>
        ${
          getPaymentDetails(transaction)
            ? `<div class="small">${getPaymentDetails(transaction)}</div>`
            : ""
        }
    `
      )
      .join("")}
    
    <div class="separator"></div>
    
    <div class="total-section">
        <div class="total-line">
            <span class="bold">Amount due</span>
            <span class="bold">${formatCurrency(receipt.total)}</span>
        </div>
    </div>
    
    <div class="separator"></div>
    
    <div class="footer">
        <div class="thank-you center">We Love Coffee!!</div>
        <div class="timestamp center">${formatDate(
          new Date().toISOString()
        )}</div>
    </div>
</body>
</html>`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getClientName = (clientId: number) => {
    return (
      clients.find((client) => client.id === clientId)?.name || "Unknown Client"
    );
  };

  const filteredReceipts = Array.isArray(receipts)
    ? receipts.filter((receipt) =>
        getClientName(receipt.clientId)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : [];

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchReceipts({ page: newPage });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (receiptError) {
    return (
      <div className="text-center py-16">
        <div className="text-red-500 mb-4">{receiptError}</div>
        <button
          onClick={() => fetchReceipts({ page: currentPage })}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Receipts</h1>
          <p className="text-gray-600 mt-2">
            Manage payment receipts and transaction records.
          </p>
        </div>
        <Link to="/receipts/add" className="btn btn-primary">
          <Plus size={18} />
          Create Receipt
        </Link>
      </div>

      {receipts.length > 0 && (
        <div className="card">
          <div className="card-body">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search receipts by client name..."
                className="form-input pl-12 border-gray-300 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {receipts.length === 0 ? (
        <EmptyState
          title="No receipts found"
          description="Create your first receipt to get started with payment tracking."
          icon={<Receipt size={64} />}
          action={
            <Link to="/receipts/add" className="btn btn-primary">
              <Plus size={18} />
              Create Receipt
            </Link>
          }
        />
      ) : filteredReceipts.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="empty-state-icon mx-auto mb-4">
              <Search size={48} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-500">
              No receipts match your search criteria. Try adjusting your search
              terms.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Client
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Transactions
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="animate-slide-in">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {formatDate(receipt.date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {getClientName(receipt.clientId)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ID: {receipt.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(receipt.total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center gap-2 flex-col">
                        <span className="badge badge-primary">
                          {receipt.transactions.length} payment
                          {receipt.transactions.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1">
                        <Link
                          to={`/receipts/view/${receipt.id}`}
                          className="action-btn action-btn-primary"
                          title="View receipt"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/receipts/edit/${receipt.id}`}
                          className="action-btn action-btn-primary"
                          title="Edit receipt"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handlePrint(receipt.id)}
                          className="action-btn action-btn-primary"
                          title="Print thermal receipt"
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(receipt.id)}
                          className="action-btn action-btn-danger"
                          title="Delete receipt"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="card">
              <div className="card-footer">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    of {pagination.total} receipts
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="btn btn-outline btn-sm"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-700">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="btn btn-outline btn-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReceiptList;
