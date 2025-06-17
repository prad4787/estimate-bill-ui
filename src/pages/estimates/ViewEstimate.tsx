import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Download, FileText } from "lucide-react";
import { useEstimateStore } from "../../store/estimateStore";
import { useClientStore } from "../../store/clientStore";
import { useOrganizationStore } from "../../store/organizationStore";
import { Client } from "../../types";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

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
      {/* Action Bar - Hidden on Print */}
      <div className="flex justify-between items-center no-print">
        <button
          onClick={() => navigate("/estimates")}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Estimates
        </button>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="btn btn-outline hover:bg-gray-50"
          >
            <Printer size={18} />
            Print Estimate
          </button>
          <button onClick={handleDownload} className="btn btn-primary">
            <Download size={18} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Estimate Document */}
      <div
        className="bg-white shadow-lg border border-gray-200 rounded-lg print:shadow-none print:border-0"
        id="estimate-print"
      >
        <div className="p-8 print:p-6">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200">
            <div className="flex items-start gap-6">
              {organization.logo && (
                <div className="flex-shrink-0">
                  <img
                    src={organization.logo}
                    alt={organization.name}
                    className="h-20 w-auto object-contain print:h-16"
                  />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-3 print:text-2xl">
                  {organization.name}
                </h1>
                <div className="text-sm text-gray-600 space-y-1 print:text-xs">
                  <p className="font-medium">{organization.address}</p>
                  <div className="flex flex-wrap gap-4">
                    {organization.phones.length > 0 && (
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Phone:</span>{" "}
                        {organization.phones[0]}
                      </span>
                    )}
                    {organization.emails.length > 0 && (
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Email:</span>{" "}
                        {organization.emails[0]}
                      </span>
                    )}
                  </div>
                  {organization.website && (
                    <p className="flex items-center gap-1">
                      <span className="font-medium">Website:</span>{" "}
                      {organization.website}
                    </p>
                  )}
                  {organization.taxId && (
                    <p className="flex items-center gap-1">
                      <span className="font-medium">Tax ID:</span>{" "}
                      {organization.taxId}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg mb-3 print:bg-blue-600 print:text-white">
                <h2 className="text-2xl font-bold print:text-xl">ESTIMATE</h2>
              </div>
              <div className="text-sm text-gray-600 space-y-2 print:text-xs">
                <div className="bg-gray-50 p-3 rounded-lg print:bg-gray-100">
                  <p className="font-semibold text-gray-900">
                    Estimate #: {currentEstimate.number}
                  </p>
                  <p className="text-gray-600">
                    Date: {formatDate(currentEstimate.date)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Client and Organization Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 p-6 rounded-lg print:bg-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                Bill To:
              </h3>
              <div className="text-gray-700 space-y-2">
                <p className="font-bold text-lg text-gray-900">{client.name}</p>
                {client.address && (
                  <p className="text-gray-600">{client.address}</p>
                )}
                {client.panVat && (
                  <p className="text-gray-600">
                    <span className="font-medium">PAN/VAT:</span>{" "}
                    {client.panVat}
                  </p>
                )}
                {client.phone && (
                  <p className="text-gray-600">
                    <span className="font-medium">Phone:</span> {client.phone}
                  </p>
                )}
                {client.email && (
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span> {client.email}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg print:bg-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                From:
              </h3>
              <div className="text-gray-700 space-y-2">
                <p className="font-bold text-lg text-gray-900">
                  {organization.name}
                </p>
                <p className="text-gray-600">{organization.address}</p>
                {organization.taxId && (
                  <p className="text-gray-600">
                    <span className="font-medium">Tax ID:</span>{" "}
                    {organization.taxId}
                  </p>
                )}
                {organization.registrationNumber && (
                  <p className="text-gray-600">
                    <span className="font-medium">Reg. No:</span>{" "}
                    {organization.registrationNumber}
                  </p>
                )}
                {organization.phones.length > 0 && (
                  <p className="text-gray-600">
                    <span className="font-medium">Phone:</span>{" "}
                    {organization.phones[0]}
                  </p>
                )}
                {organization.emails.length > 0 && (
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span>{" "}
                    {organization.emails[0]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full border-2 border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                  <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 border-b-2 border-gray-300">
                    SN
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 border-b-2 border-gray-300">
                    Item Description
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 border-b-2 border-gray-300">
                    Quantity
                  </th>
                  <th className="px-4 py-4 text-right text-sm font-bold text-gray-700 border-b-2 border-gray-300">
                    Rate
                  </th>
                  <th className="px-4 py-4 text-right text-sm font-bold text-gray-700 border-b-2 border-gray-300">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentEstimate.items.map((item, index) => (
                  <React.Fragment key={index}>
                    <tr className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-200 font-medium">
                        {item.sn}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-200">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.item}
                          </p>
                          {item.description && (
                            <p className="text-gray-600 text-xs mt-1 italic">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-200 text-center font-medium">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-200 text-right font-medium">
                        {formatCurrency(item.rate)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-200 text-right font-bold">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end">
            <div className="w-96">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border-2 border-gray-200">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Subtotal:</span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(currentEstimate.subTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">
                      Discount
                      {currentEstimate.discountType === "rate"
                        ? ` (${currentEstimate.discountValue}%)`
                        : ""}
                      :
                    </span>
                    <span className="font-bold text-red-600">
                      -{formatCurrency(currentEstimate.discountAmount)}
                    </span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        Total Amount:
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(currentEstimate.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t-2 border-gray-200">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-4">
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  Thank you for your business!
                </p>
                <p className="text-gray-600">
                  This estimate is valid for 30 days from the date of issue.
                </p>
              </div>
              <div className="flex justify-center gap-6 text-xs text-gray-500 print:text-xs">
                {organization.phones.length > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Phone:</span>{" "}
                    {organization.phones[0]}
                  </span>
                )}
                {organization.emails.length > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Email:</span>{" "}
                    {organization.emails[0]}
                  </span>
                )}
                {organization.website && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Web:</span>{" "}
                    {organization.website}
                  </span>
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
