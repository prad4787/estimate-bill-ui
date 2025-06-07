import { create } from 'zustand';
import { Estimate, EstimateFormData, PaymentMedium } from '../types';

const STORAGE_KEY = 'billmanager-estimates';

interface EstimateState {
  estimates: Estimate[];
  loading: boolean;
  error: string | null;
  fetchEstimates: () => void;
  addEstimate: (estimate: EstimateFormData) => string;
  updateEstimate: (id: string, updates: Partial<Estimate>) => void;
  getEstimate: (id: string) => Estimate | undefined;
  deleteEstimate: (id: string) => void;
}

// Load estimates from localStorage
const loadEstimates = (): Estimate[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load estimates from localStorage', error);
    return [];
  }
};

// Save estimates to localStorage
const saveEstimates = (estimates: Estimate[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estimates));
  } catch (error) {
    console.error('Failed to save estimates to localStorage', error);
  }
};

// Generate estimate number
const generateEstimateNumber = (estimates: Estimate[]): string => {
  const prefix = 'EST';
  const currentYear = new Date().getFullYear().toString();
  const lastEstimate = estimates
    .filter(e => e.number.includes(currentYear))
    .sort((a, b) => b.number.localeCompare(a.number))[0];

  if (!lastEstimate) {
    return `${prefix}/${currentYear}/0001`;
  }

  const lastNumber = parseInt(lastEstimate.number.split('/').pop() || '0000');
  const newNumber = (lastNumber + 1).toString().padStart(4, '0');
  return `${prefix}/${currentYear}/${newNumber}`;
};

// Calculate totals
const calculateTotals = (items: EstimateFormData['items'], discountType: 'rate' | 'amount', discountValue: number) => {
  const subTotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = discountType === 'rate' 
    ? (subTotal * discountValue) / 100 
    : discountValue;
  const total = subTotal - discountAmount;

  return { subTotal, discountAmount, total };
};

export const useEstimateStore = create<EstimateState>((set, get) => ({
  estimates: [],
  loading: false,
  error: null,

  fetchEstimates: () => {
    set({ loading: true, error: null });
    try {
      const estimates = loadEstimates();
      set({ estimates, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch estimates', loading: false });
    }
  },

  addEstimate: (estimateData) => {
    const estimates = get().estimates;
    const now = new Date().toISOString();
    const id = `estimate_${Date.now()}`;
    const number = generateEstimateNumber(estimates);

    const { subTotal, discountAmount, total } = calculateTotals(
      estimateData.items,
      estimateData.discountType,
      estimateData.discountValue
    );

    const newEstimate: Estimate = {
      id,
      number,
      date: estimateData.date,
      clientId: estimateData.clientId,
      items: estimateData.items,
      subTotal,
      discountType: estimateData.discountType,
      discountValue: estimateData.discountValue,
      discountAmount,
      total,
      createdAt: now,
      updatedAt: now,
    };

    set((state) => {
      const updatedEstimates = [...state.estimates, newEstimate];
      saveEstimates(updatedEstimates);
      return { estimates: updatedEstimates };
    });

    return id;
  },

  updateEstimate: (id, updates) => {
    set((state) => {
      const index = state.estimates.findIndex(e => e.id === id);
      if (index === -1) return state;

      const updatedEstimates = [...state.estimates];
      updatedEstimates[index] = {
        ...updatedEstimates[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      saveEstimates(updatedEstimates);
      return { estimates: updatedEstimates };
    });
  },

  getEstimate: (id) => {
    return get().estimates.find((estimate) => estimate.id === id);
  },

  deleteEstimate: (id) => {
    set((state) => {
      const updatedEstimates = state.estimates.filter((estimate) => estimate.id !== id);
      saveEstimates(updatedEstimates);
      return { estimates: updatedEstimates };
    });
  },
}));