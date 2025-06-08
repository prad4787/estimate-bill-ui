import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, ArrowLeft } from 'lucide-react';
import { useEstimateStore } from '../../store/estimateStore';
import { useClientStore } from '../../store/clientStore';
import { useStockStore } from '../../store/stockStore';
import { EstimateFormData, EstimateItem, Client } from '../../types';
import SuccessModal from '../../components/estimates/SuccessModal';
import ClientModal from '../../components/clients/ClientModal';
import ClientSelect from '../../components/clients/ClientSelect';
import SearchableSelect, { SelectOption } from '../../components/ui/SearchableSelect';

const AddEstimate: React.FC = () => {
  const navigate = useNavigate();
  const { addEstimate } = useEstimateStore();
  const { clients, fetchClients } = useClientStore();
  const { stocks, fetchStocks, addStock } = useStockStore();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
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
    fetchStocks();
  }, [fetchClients, fetchStocks]);


  const handleClientCreated = (newClient: Client) => {
    setSelectedClient(newClient);
    setShowClientModal(false);
    fetchClients(); // Refresh the clients list
  };

  // Convert stocks to SelectOption format
  const stockOptions: SelectOption[] = stocks.map(stock => ({
    id: stock.id,
    name: stock.name,
    quantity: stock.quantity,
    createdAt: stock.createdAt
  }));

  // Handle creating new stock item
  const handleCreateStock = async (name: string): Promise<SelectOption> => {
    const stockId = addStock({
      name,
      quantity: null // New items are untracked by default
    });
    
    const newStock = {
      id: stockId,
      name,
      quantity: null,
      createdAt: new Date().toISOString()
    };
    
    return newStock;
  };

  // Render stock option with quantity info
  const renderStockOption = (option: SelectOption) => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{option.name}</div>
        <div className="text-xs text-gray-500 mt-1">
          {option.quantity !== null ? `Stock: ${option.quantity}` : 'Quantity not tracked'}
        </div>
      </div>
      {option.quantity !== null && option.quantity < 10 && (
        <div className="ml-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            option.quantity === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {option.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
          </span>
        </div>
      )}
    </div>
  );
  const calculateItemTotal = (quantity: number, rate: number) => {
    return quantity * rate;
  };

  const handleItemChange = (index: number, field: keyof EstimateItem | 'stockOption', value: string | number | SelectOption | null) => {
    const newItems = [...items];
    
    if (field === 'stockOption') {
      // Handle stock selection
      const stockOption = value as SelectOption | null;
      newItems[index] = {
        ...newItems[index],
        item: stockOption ? stockOption.name : ''
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
    }

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
          className="inline-flex items-center text-gray-600 mb-6"
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
                              type="number"
                              className="form-input pl-8"
                            <SearchableSelect
                              options={stockOptions}
                              value={selectedStockOption}
                              onChange={(option) => handleItemChange(index, 'stockOption', option)}
                              onCreateNew={handleCreateStock}
                              placeholder="Select or create item..."
                              searchPlaceholder="Search items or type to create..."
                              createLabel="Create item"
                              renderOption={renderStockOption}
                              className="min-w-[250px]"
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