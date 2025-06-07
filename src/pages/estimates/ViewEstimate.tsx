import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { useEstimateStore } from '../../store/estimateStore';
import { useClientStore } from '../../store/clientStore';

const ViewEstimate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEstimate } = useEstimateStore();
  const { getClient } = useClientStore();
  
  const estimate = id ? getEstimate(id) : undefined;
  const client = estimate ? getClient(estimate.clientId) : undefined;

  if (!estimate || !client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-medium mb-2">Estimate Not Found</h2>
        <p className="text-gray-500 mb-6">The estimate you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/estimates')}
          className="btn btn-primary"
        >
          Back to Estimates
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement PDF download functionality
    console.log('Download PDF');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate('/estimates')}
          className="inline-flex items-center text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Estimates
        </button>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="btn btn-outline inline-flex items-center"
          >
            <Printer size={16} className="mr-2" />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="btn btn-primary inline-flex items-center"
          >
            <Download size={16} className="mr-2" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="card p-8" id="estimate-print">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ESTIMATE</h1>
          <div className="mt-4 grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-medium mb-2">Bill To:</h3>
              <div className="text-gray-600">
                <p className="font-medium">{client.name}</p>
                {client.address && <p>{client.address}</p>}
                {client.panVat && <p>PAN/VAT: {client.panVat}</p>}
              </div>
            </div>
            <div className="text-right">
              <div className="space-y-1">
                <p>
                  <span className="font-medium">Estimate Number: </span>
                  {estimate.number}
                </p>
                <p>
                  <span className="font-medium">Date: </span>
                  {formatDate(estimate.date)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">SN</th>
                <th className="px-4 py-2 text-left">Item</th>
                <th className="px-4 py-2 text-right">Quantity</th>
                <th className="px-4 py-2 text-right">Rate</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {estimate.items.map((item, index) => (
                <React.Fragment key={index}>
                  <tr>
                    <td className="px-4 py-2">{item.sn}</td>
                    <td className="px-4 py-2">{item.item}</td>
                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                    <td className="px-4 py-2 text-right">${item.rate.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">${item.total.toFixed(2)}</td>
                  </tr>
                  {item.description && (
                    <tr>
                      <td></td>
                      <td colSpan={4} className="px-4 py-2 text-gray-600 text-sm">
                        {item.description}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${estimate.subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>
                Discount 
                {estimate.discountType === 'rate' 
                  ? ` (${estimate.discountValue}%)`
                  : ''}:
              </span>
              <span>${estimate.discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium text-lg border-t pt-2">
              <span>Total:</span>
              <span>${estimate.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewEstimate