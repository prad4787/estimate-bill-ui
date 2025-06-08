import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Edit2 } from 'lucide-react';
import { useReceiptStore } from '../../store/receiptStore';
import { useClientStore } from '../../store/clientStore';
import { useOrganizationStore } from '../../store/organizationStore';

const ViewReceipt: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getReceipt } = useReceiptStore();
  const { getClient } = useClientStore();
  const { organization, fetchOrganization } = useOrganizationStore();
  
  const receipt = id ? getReceipt(id) : undefined;
  const client = receipt ? getClient(receipt.clientId) : undefined;

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  if (!receipt || !client) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-4">Receipt Not Found</h2>
          <p className="text-gray-500 mb-8">The receipt you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/receipts')}
            className="btn btn-primary"
          >
            Back to Receipts
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPaymentType = (type: string) => {
    switch (type) {
      case 'cash': return 'Cash Payment';
      case 'bank': return 'Bank Transfer';
      case 'wallet': return 'E-Wallet';
      case 'cheque': return 'Cheque Payment';
      default: return type;
    }
  };

  const getPaymentDetails = (transaction: any) => {
    if (transaction.paymentType === 'cash') {
      return 'Cash Payment';
    }
    
    if (transaction.paymentType === 'cheque' && transaction.chequeDetails) {
      return (
        <div className="text-sm text-gray-600 mt-1">
          <div>Cheque: {transaction.chequeDetails.chequeNumber}</div>
          <div>Bank: {transaction.chequeDetails.bankName}</div>
          <div>Name: {transaction.chequeDetails.chequeName}</div>
          <div>Date: {new Date(transaction.chequeDetails.chequeDate).toLocaleDateString()}</div>
        </div>
      );
    }
    
    if (transaction.paymentMedium) {
      if (transaction.paymentMedium.type === 'bank') {
        return (
          <div className="text-sm text-gray-600 mt-1">
            <div>{transaction.paymentMedium.bankName}</div>
            <div>Account: {transaction.paymentMedium.accountName}</div>
            <div>Number: {transaction.paymentMedium.accountNumber}</div>
          </div>
        );
      }
      if (transaction.paymentMedium.type === 'wallet') {
        return (
          <div className="text-sm text-gray-600 mt-1">
            <div>{transaction.paymentMedium.walletName}</div>
            <div>Account: {transaction.paymentMedium.accountName}</div>
            <div>Number: {transaction.paymentMedium.accountNumber}</div>
          </div>
        );
      }
    }
    
    return null;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Create a new window with the receipt content for PDF generation
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const receiptContent = generateThermalReceiptHTML();
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Trigger print dialog which can be used to save as PDF
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const generateThermalReceiptHTML = () => {
    const formatDateThermal = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const formatCurrencyThermal = (amount: number) => {
      return `$${amount.toFixed(2)}`;
    };

    const formatPaymentTypeThermal = (type: string) => {
      switch (type) {
        case 'cash': return 'CASH';
        case 'bank': return 'BANK TRANSFER';
        case 'wallet': return 'E-WALLET';
        case 'cheque': return 'CHEQUE';
        default: return type.toUpperCase();
      }
    };

    const getPaymentDetailsThermal = (transaction: any) => {
      if (transaction.paymentType === 'cash') {
        return '';
      }
      
      if (transaction.paymentType === 'cheque' && transaction.chequeDetails) {
        return `Cheque No: ${transaction.chequeDetails.chequeNumber}`;
      }
      
      if (transaction.paymentMedium) {
        if (transaction.paymentMedium.type === 'bank') {
          return `${transaction.paymentMedium.bankName}`;
        }
        if (transaction.paymentMedium.type === 'wallet') {
          return `${transaction.paymentMedium.walletName}`;
        }
      }
      
      return '';
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
        
        .footer {
            text-align: right;
            margin-top: 8px;
            font-size: 9px;
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
        
        .small {
            font-size: 9px;
        }
        
        .bold {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">${organization.name}</div>
        <div class="company-address">${organization.address}</div>
    </div>
    
    <div class="currency center">Receipt currency: US Dollars</div>
    
    <div class="bill-title">BILL</div>
    
    <div class="order-info">
        <div>Order: ${receipt.id.substring(0, 8)} - ${formatDateThermal(receipt.date).split(' ')[1]}</div>
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
    
    ${receipt.transactions.map((transaction, index) => `
        <div class="item-line">
            <span class="item-name">${formatPaymentTypeThermal(transaction.paymentType)} Payment</span>
            <span class="item-price">${formatCurrencyThermal(transaction.amount)}</span>
        </div>
        <div class="item-qty">1 x ${formatCurrencyThermal(transaction.amount)}</div>
        ${getPaymentDetailsThermal(transaction) ? `<div class="small">${getPaymentDetailsThermal(transaction)}</div>` : ''}
    `).join('')}
    
    <div class="separator"></div>
    
    <div class="total-section">
        <div class="total-line">
            <span class="bold">Amount due</span>
            <span class="bold">${formatCurrencyThermal(receipt.total)}</span>
        </div>
    </div>
    
    <div class="separator"></div>
    
    <div class="footer">
        <div class="thank-you center">We Love Coffee!!</div>
        <div class="timestamp center">${formatDateThermal(new Date().toISOString())}</div>
    </div>
</body>
</html>`;
  };

  const generateReceiptHTML = () => {
    const getPaymentDetailsForPrint = (transaction: any) => {
      if (transaction.paymentType === 'cash') {
        return 'Cash Payment';
      }
      
      if (transaction.paymentType === 'cheque' && transaction.chequeDetails) {
        return `Cheque: ${transaction.chequeDetails.chequeNumber}<br>Bank: ${transaction.chequeDetails.bankName}<br>Name: ${transaction.chequeDetails.chequeName}<br>Date: ${new Date(transaction.chequeDetails.chequeDate).toLocaleDateString()}`;
      }
      
      if (transaction.paymentMedium) {
        if (transaction.paymentMedium.type === 'bank') {
          return `${transaction.paymentMedium.bankName}<br>Account: ${transaction.paymentMedium.accountName}<br>Number: ${transaction.paymentMedium.accountNumber}`;
        }
        if (transaction.paymentMedium.type === 'wallet') {
          return `${transaction.paymentMedium.walletName}<br>Account: ${transaction.paymentMedium.accountName}<br>Number: ${transaction.paymentMedium.accountNumber}`;
        }
      }
      
      return formatPaymentType(transaction.paymentType);
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Receipt - ${receipt.id}</title>
    <style>
        @media print {
            @page {
                size: A4;
                margin: 20mm;
            }
            body {
                margin: 0;
                padding: 0;
            }
        }
        
        body {
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        
        .receipt-container {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 30px;
            background: white;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .company-logo {
            max-height: 80px;
            max-width: 200px;
            margin-bottom: 15px;
        }
        
        .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
        }
        
        .company-details {
            font-size: 12px;
            color: #6b7280;
            line-height: 1.4;
        }
        
        .receipt-title {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin: 20px 0 10px 0;
        }
        
        .receipt-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            gap: 40px;
        }
        
        .info-section {
            flex: 1;
        }
        
        .info-title {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
        }
        
        .info-content {
            font-size: 14px;
            color: #374151;
        }
        
        .info-line {
            margin-bottom: 5px;
        }
        
        .transactions-section {
            margin: 30px 0;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
        }
        
        .transaction {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            background: #f9fafb;
        }
        
        .transaction-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .transaction-amount {
            font-size: 20px;
            font-weight: bold;
            color: #059669;
        }
        
        .transaction-type {
            background: #dbeafe;
            color: #1e40af;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .transaction-details {
            font-size: 13px;
            color: #6b7280;
            line-height: 1.5;
        }
        
        .total-section {
            border-top: 2px solid #e5e7eb;
            padding-top: 20px;
            margin-top: 30px;
            text-align: right;
        }
        
        .total-amount {
            font-size: 28px;
            font-weight: bold;
            color: #059669;
        }
        
        .total-label {
            font-size: 18px;
            color: #374151;
            margin-bottom: 10px;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
        }
        
        .thank-you {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            ${organization.logo ? `<img src="${organization.logo}" alt="${organization.name}" class="company-logo">` : ''}
            <div class="company-name">${organization.name}</div>
            <div class="company-details">
                ${organization.address}<br>
                ${organization.phones.length > 0 ? `Phone: ${organization.phones[0]}` : ''} 
                ${organization.emails.length > 0 ? `| Email: ${organization.emails[0]}` : ''}<br>
                ${organization.website ? `Website: ${organization.website}` : ''}
            </div>
            <div class="receipt-title">PAYMENT RECEIPT</div>
        </div>
        
        <div class="receipt-info">
            <div class="info-section">
                <div class="info-title">Receipt Information</div>
                <div class="info-content">
                    <div class="info-line"><strong>Receipt ID:</strong> ${receipt.id}</div>
                    <div class="info-line"><strong>Date:</strong> ${formatDate(receipt.date)}</div>
                    <div class="info-line"><strong>Created:</strong> ${formatDate(receipt.createdAt)}</div>
                </div>
            </div>
            
            <div class="info-section">
                <div class="info-title">Received From</div>
                <div class="info-content">
                    <div class="info-line"><strong>${client.name}</strong></div>
                    ${client.address ? `<div class="info-line">${client.address}</div>` : ''}
                    ${client.panVat ? `<div class="info-line">PAN/VAT: ${client.panVat}</div>` : ''}
                </div>
            </div>
        </div>
        
        <div class="transactions-section">
            <div class="section-title">Payment Details</div>
            ${receipt.transactions.map((transaction, index) => `
                <div class="transaction">
                    <div class="transaction-header">
                        <div>
                            <div style="font-weight: 600; color: #1f2937;">Payment ${index + 1}</div>
                            <div class="transaction-type">${formatPaymentType(transaction.paymentType)}</div>
                        </div>
                        <div class="transaction-amount">${formatCurrency(transaction.amount)}</div>
                    </div>
                    <div class="transaction-details">
                        ${getPaymentDetailsForPrint(transaction)}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="total-section">
            <div class="total-label">Total Amount Received:</div>
            <div class="total-amount">${formatCurrency(receipt.total)}</div>
        </div>
        
        <div class="footer">
            <div class="thank-you">Thank you for your payment!</div>
            <div>This is a computer-generated receipt and does not require a signature.</div>
            ${organization.website ? `<div style="margin-top: 10px;">${organization.website}</div>` : ''}
        </div>
    </div>
</body>
</html>`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center no-print">
        <button 
          onClick={() => navigate('/receipts')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Receipts
        </button>
        <div className="flex gap-3">
          <Link
            to={`/receipts/edit/${receipt.id}`}
            className="btn btn-outline"
          >
            <Edit2 size={18} />
            Edit Receipt
          </Link>
          <button
            onClick={handlePrint}
            className="btn btn-outline"
          >
            <Printer size={18} />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="btn btn-primary"
          >
            <Download size={18} />
            Download PDF
          </button>
        </div>
      </div>

      <div className="card" id="receipt-print">
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{organization.name}</h1>
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
              <h2 className="text-3xl font-bold text-blue-600 mb-2">RECEIPT</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Receipt ID:</span> {receipt.id.substring(0, 12)}...</p>
                <p><span className="font-medium">Date:</span> {formatDate(receipt.date)}</p>
                <p><span className="font-medium">Created:</span> {formatDate(receipt.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Received From:</h3>
              <div className="text-gray-700">
                <p className="font-medium text-lg">{client.name}</p>
                {client.address && <p className="mt-1">{client.address}</p>}
                {client.panVat && <p className="mt-1">PAN/VAT: {client.panVat}</p>}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Summary:</h3>
              <div className="text-gray-700">
                <p className="text-sm">Total Transactions: <span className="font-medium">{receipt.transactions.length}</span></p>
                <p className="text-sm">Payment Date: <span className="font-medium">{formatDate(receipt.date)}</span></p>
                <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(receipt.total)}</p>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Payment Details</h3>
            <div className="space-y-4">
              {receipt.transactions.map((transaction, index) => (
                <div key={transaction.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">Payment {index + 1}</h4>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                        {formatPaymentType(transaction.paymentType)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  </div>
                  {getPaymentDetails(transaction)}
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="w-80">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="border-t border-gray-300 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total Amount Received:</span>
                    <span className="text-2xl font-bold text-green-600">{formatCurrency(receipt.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200 text-center">
            <div className="text-sm text-gray-600">
              <p className="mb-2 text-lg font-semibold text-gray-900">Thank you for your payment!</p>
              <p className="mb-4">This is a computer-generated receipt and does not require a signature.</p>
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

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .card {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewReceipt;