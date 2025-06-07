import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Search } from 'lucide-react';
import { useEstimateStore } from '../../store/estimateStore';
import { useClientStore } from '../../store/clientStore';
import { EstimateFormData, EstimateItem, Client } from '../../types';
import SuccessModal from '../../components/estimates/SuccessModal';

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

  React.useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1>Create Estimate</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <div className="space-y-4">
            <div className="relative">
              <label className="form-label">Client</label>
              {selectedClient ? (
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <div className="font-medium">{selectedClient.name}</div>
                    {selectedClient.address && (
                      <div className="text-sm text-gray-500">{selectedClient.address}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedClient(null)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowClientSearch(true);
                    }}
                  />
                  {showClientSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                      {filteredClients.map(client => (
                        <div
                          key={client.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setSelectedClient(client);
                            setShowClientSearch(false);
                            setSearchTerm('');
                          }}
                        >
                          <div className="font-medium">{client.name}</div>
                          {client.address && (
                            <div className="text-sm text-gray-500">{client.address}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">SN</th>
                    <th className="px-4 py-2 text-left">Item</th>
                    <th className="px-4 py-2 text-left">Quantity</th>
                    <th className="px-4 py-2 text-left">Rate</th>
                    <th className="px-4 py-2 text-left">Total</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <React.Fragment key={index}>
                      <tr>
                        <td className="px-4 py-2">{item.sn}</td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            className="form-input"
                            value={item.item}
                            onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            className="form-input"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            min="1"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            className="form-input"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))}
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-2">
                          {item.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                            disabled={items.length === 1}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td colSpan={5} className="px-4 py-2">
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Description"
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

            <div className="flex justify-end">
              <button
                type="button"
                onClick={addNewItem}
                className="btn btn-outline"
              >
                <Plus size={16} className="mr-1" />
                Add Item
              </button>
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${calculateSubTotal().toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      className="form-input"
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as 'rate' | 'amount')}
                    >
                      <option value="rate">Discount (%)</option>
                      <option value="amount">Discount ($)</option>
                    </select>
                    <input
                      type="number"
                      className="form-input"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      min="0"
                      step={discountType === 'rate' ? '1' : '0.01'}
                    />
                  </div>

                  <div className="flex justify-between font-medium text-lg">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
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
            {isSubmitting ? 'Creating...' : 'Create Estimate'}
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
    </div>
  );
};

export default AddEstimate;