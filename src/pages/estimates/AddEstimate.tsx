import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Search, UserPlus, ArrowLeft } from 'lucide-react';
import { useEstimateStore } from '../../store/estimateStore';
import { useClientStore } from '../../store/clientStore';
import { EstimateFormData, EstimateItem, Client } from '../../types';
import SuccessModal from '../../components/estimates/SuccessModal';
import ClientModal from '../../components/clients/ClientModal';

const AddEstimate: React.FC = () => {
  const navigate = useNavigate();
  const { addEstimate } = useEstimateStore();
  const { clients, fetchClients } = useClientStore();
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [items, setItems] = useState<EstimateItem[]>([
    {
      sn: 1,
      item: '',
      quantity: 1,
      rate: 0,
      total: 0,
      description: ''
    }
  ]);
  const [discountType, setDiscountType] = useState<'rate' | 'amount'>('rate');
  const [discountValue, setDiscountValue] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedEstimateId, setSavedEstimateId] = useState<string | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);

  React.useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClientCreated = (newClient: Client) => {
    setSelectedClient(newClient);
    setShowClientModal(false);
    fetchClients(); // Refresh the clients list
  };

  const calculateItemTotal = (quantity: number, rate: number) => {
    return quantity * rate;
  };

  const handleItemChange = (index: number, field: keyof EstimateItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    if (field === 'quantity' || field === 'rate') {
      newItems[index].total = calculateItemTotal(
        field === 'quantity' ? Number(value) : newItems[index].quantity,
        field === 'rate' ? Number(value) : newItems[index].rate
      );
    }

    setItems(newItems);
  };

  const addNewItem = () => {
    setItems([
      ...items,
      {
        sn: items.length + 1,
        item: '',
        quantity: 1,
        rate: 0,
        total: 0,
        description: ''
      }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      // Recalculate SN for remaining items
      newItems.forEach((item, i) => {
        item.sn = i + 1;
      });
      setItems(newItems);
    }
  };

  const calculateSubTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateDiscount = () => {
    const subTotal = calculateSubTotal();
    return discountType === 'rate'
      ? (subTotal * discountValue) / 100
      : discountValue;
  };

  const calculateTotal = () => {
    return calculateSubTotal() - calculateDiscount();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      toast.error('Please select a client');
      return;
    }

    if (items.some(item => !item.item || item.quantity <= 0 || item.rate <= 0)) {
      toast.error('Please fill in all item details correctly');
      return;
    }

    setIsSubmitting(true);

    try {
      const estimateData: EstimateFormData = {
        date: new Date().toISOString(),
        clientId: selectedClient.id,
        items,
        discountType,
        discountValue
      };

      const id = addEstimate(estimateData);
      setSavedEstimateId(id);
      setShowSuccessModal(true);
    } catch (error) {
      toast.error('Failed to create estimate');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <button 
          onClick={() => navigate('/estimates')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Estimates
        </button>
        <div className="page-header">
          <div>
            <h1 className="page-title">Create Estimate</h1>
            <p className="text-gray-600 mt-2">Generate a professional estimate for your client.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Client Information</h2>
          </div>
          <div className="card-body">
            <div className="relative">
              <label className="form-label">Client</label>
              {selectedClient ? (
                <div className="flex justify-between items-center p-4 border border-gray-300 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100">
                  <div>
                    <div className="font-semibold text-gray-900">{selectedClient.name}</div>
                    {selectedClient.address && (
                      <div className="text-sm text-gray-600">{selectedClient.address}</div>
                    )}
                    {selectedClient.panVat && (
                      <div className="text-sm text-gray-500">PAN/VAT: {selectedClient.panVat}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedClient(null)}
                    className="btn btn-outline btn-sm"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search existing clients..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowClientSearch(true);
                      }}
                    />
                    {showClientSearch && searchTerm && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {filteredClients.length > 0 ? (
                          filteredClients.map(client => (
                            <div
                              key={client.id}
                              className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => {
                                setSelectedClient(client);
                                setShowClientSearch(false);
                                setSearchTerm('');
                              }}
                            >
                              <div className="font-medium text-gray-900">{client.name}</div>
                              {client.address && (
                                <div className="text-sm text-gray-500">{client.address}</div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-gray-500 text-center">
                            No clients found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                    
                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500 font-medium">Don't see your client?</span>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => setShowClientModal(true)}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
                      >
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                          <UserPlus size={20} />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">Create New Client</div>
                          <div className="text-sm text-blue-500">Add a new client to your database</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Items & Services</h2>
          </div>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">SN</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Item</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Rate</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <React.Fragment key={index}>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.sn}</td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            className="form-input"
                            value={item.item}
                            onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                            placeholder="Item name"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            className="form-input"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            min="1"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              className="form-input pl-8"
                              value={item.rate}
                              onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))}
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          ${item.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="action-btn action-btn-danger"
                            disabled={items.length === 1}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td colSpan={5} className="px-4 py-3">
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Description (optional)"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          />
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={addNewItem}
                className="btn btn-outline"
              >
                <Plus size={18} />
                Add Item
              </button>
            </div>

            <div className="mt-8 flex justify-end">
              <div className="w-80 space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="font-medium">Subtotal:</span>
                  <span>${calculateSubTotal().toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-4">
                  <select
                    className="form-input flex-1"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'rate' | 'amount')}
                  >
                    <option value="rate">Discount (%)</option>
                    <option value="amount">Discount ($)</option>
                  </select>
                  <input
                    type="number"
                    className="form-input flex-1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    min="0"
                    step={discountType === 'rate' ? '1' : '0.01'}
                    placeholder={discountType === 'rate' ? '0' : '0.00'}
                  />
                </div>

                <div className="flex justify-between text-xl font-bold border-t pt-4">
                  <span>Total:</span>
                  <span className="text-blue-600">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/estimates')}
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
              'Create Estimate'
            )}
          </button>
        </div>
      </form>

      {showSuccessModal && savedEstimateId && (
        <SuccessModal
          estimateId={savedEstimateId}
          onClose={() => {
            setShowSuccessModal(false);
            navigate('/estimates');
          }}
        />
      )}

      <ClientModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onClientCreated={handleClientCreated}
      />
    </div>
  );
};

export default AddEstimate;