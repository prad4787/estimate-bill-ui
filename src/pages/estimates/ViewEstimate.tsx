import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { useEstimateStore } from "../../store/estimateStore";
import { useClientStore } from "../../store/clientStore";
import { useOrganizationStore } from "../../store/organizationStore";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Client } from "../../types";

const ViewEstimate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getEstimate,
    currentEstimate,
    currentEstimateLoading,
    currentEstimateError,
  } = useEstimateStore();
  const { getClient } = useClientStore();
  const {
    organization,
    fetchOrganization,
    loading: organizationLoading,
  } = useOrganizationStore();
  const [client, setClient] = useState<Client | null>(null);
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getEstimate(id);
    }
    fetchOrganization();
  }, [id, getEstimate, fetchOrganization]);

  useEffect(() => {
    const fetchClient = async () => {
      if (currentEstimate) {
        setClientLoading(true);
        setClientError(null);
        try {
          const clientData = await getClient(currentEstimate.clientId);
          setClient(clientData);
        } catch (error) {
          setClientError(
            error instanceof Error ? error.message : "Failed to fetch client"
          );
        } finally {
          setClientLoading(false);
        }
      }
    };

    fetchClient();
  }, [currentEstimate, getClient]);

  if (currentEstimateLoading || organizationLoading || clientLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (
    currentEstimateError ||
    clientError ||
    !currentEstimate ||
    !client ||
    !organization
  ) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-medium mb-2">
          {currentEstimateError || clientError || "Estimate Not Found"}
        </h2>
        <p className="text-gray-500 mb-6">
          {currentEstimateError ||
            clientError ||
            "The estimate you're looking for doesn't exist or has been removed."}
        </p>
        <button
          onClick={() => navigate("/estimates")}
          className="btn btn-primary"
        >
          Back to Estimates
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement PDF download functionality
    console.log("Download PDF");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center no-print">
        <button
          onClick={() => navigate("/estimates")}
          className="inline-flex items-center text-gray-600"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Estimates
        </button>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="btn btn-outline">
            <Printer size={18} />
            Print
          </button>
          <button onClick={handleDownload} className="btn btn-primary">
            <Download size={18} />
            Download PDF
          </button>
        </div>
      </div>

      <div className="card" id="estimate-print">
        <div className="card-body p-8">
          {/* Header with Organization Info */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-start gap-6">
              {organization.logo && (
                <div className="flex-shrink-0">
                  <img
                    src={organization.logo}
                    alt={organization.name}
                    className="h-16 w-auto object-contain"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {organization.name}
                </h1>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{organization.address}</p>
                  <div className="flex flex-wrap gap-4">
                    {organization.phones.length > 0 && (
                      <span>Phone: {organization.phones[0]}</span>
                    )}
                    {organization.emails.length > 0 && (
                      <span>Email: {organization.emails[0]}</span>
                    )}
                  </div>
                  {organization.website && (
                    <p>Website: {organization.website}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-blue-600 mb-2">
                ESTIMATE
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Number:</span>{" "}
                  {currentEstimate.number}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {formatDate(currentEstimate.date)}
                </p>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Bill To:
              </h3>
              <div className="text-gray-700">
                <p className="font-medium text-lg">{client.name}</p>
                {client.address && <p className="mt-1">{client.address}</p>}
                {client.panVat && (
                  <p className="mt-1">PAN/VAT: {client.panVat}</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                From:
              </h3>
              <div className="text-gray-700">
                <p className="font-medium">{organization.name}</p>
                <p>{organization.address}</p>
                {organization.taxId && <p>Tax ID: {organization.taxId}</p>}
                {organization.registrationNumber && (
                  <p>Reg. No: {organization.registrationNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                    SN
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                    Item
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b border-gray-200">
                    Rate
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b border-gray-200">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentEstimate.items.map((item, index) => (
                  <React.Fragment key={index}>
                    <tr className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                        {item.sn}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200 font-medium">
                        {item.item}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200 text-center">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200 text-right">
                        {formatCurrency(item.rate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200 text-right font-medium">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                    {item.description && (
                      <tr
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td></td>
                        <td
                          colSpan={4}
                          className="px-4 py-2 text-sm text-gray-600 italic border-b border-gray-200"
                        >
                          {item.description}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(currentEstimate.subTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Discount
                      {currentEstimate.discountType === "rate"
                        ? ` (${currentEstimate.discountValue}%)`
                        : ""}
                      :
                    </span>
                    <span className="font-medium text-gray-900">
                      -{formatCurrency(currentEstimate.discountAmount)}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">
                        Total:
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(currentEstimate.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200 text-center">
            <div className="text-sm text-gray-600">
              <p className="mb-2">Thank you for your business!</p>
              <div className="flex justify-center gap-6 text-xs">
                {organization.phones.length > 0 && (
                  <span>Phone: {organization.phones[0]}</span>
                )}
                {organization.emails.length > 0 && (
                  <span>Email: {organization.emails[0]}</span>
                )}
                {organization.website && (
                  <span>Web: {organization.website}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEstimate;
