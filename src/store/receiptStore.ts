import { create } from 'zustand';
import { Receipt, ReceiptFormData } from '../types';

const STORAGE_KEY = 'billmanager-receipts';

interface ReceiptState {
  receipts: Receipt[];
  loading: boolean;
  error: string | null;
  fetchReceipts: () => void;
  addReceipt: (receipt: ReceiptFormData) => string;
  updateReceipt: (id: string, updates: Partial<Receipt>) => void;
  getReceipt: (id: string) => Receipt | undefined;
  deleteReceipt: (id: string) => void;
}

const loadReceipts = (): Receipt[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load receipts from localStorage', error);
    return [];
  }
};

const saveReceipts = (receipts: Receipt[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
  } catch (error) {
    console.error('Failed to save receipts to localStorage', error);
  }
};

export const useReceiptStore = create<ReceiptState>((set, get) => ({
  receipts: [],
  loading: false,
  error: null,

  fetchReceipts: () => {
    set({ loading: true, error: null });
    try {
      const receipts = loadReceipts();
      set({ receipts, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch receipts', loading: false });
    }
  },

  addReceipt: (receiptData) => {
    const now = new Date().toISOString();
    const id = `receipt_${Date.now()}`;

    const total = receiptData.transactions.reduce((sum, t) => sum + t.amount, 0);

    const newReceipt: Receipt = {
      id,
      date: receiptData.date,
      clientId: receiptData.clientId,
      transactions: receiptData.transactions.map(t => ({ ...t, id: `trans_${Date.now()}_${Math.random()}` })),
      total,
      createdAt: now,
      updatedAt: now,
    };

    set((state) => {
      const updatedReceipts = [...state.receipts, newReceipt];
      saveReceipts(updatedReceipts);
      return { receipts: updatedReceipts };
    });

    return id;
  },

  updateReceipt: (id, updates) => {
    set((state) => {
      const index = state.receipts.findIndex(r => r.id === id);
      if (index === -1) return state;

      const updatedReceipts = [...state.receipts];
      updatedReceipts[index] = {
        ...updatedReceipts[index],
        ...updates,
      };

      saveReceipts(updatedReceipts);
      return { receipts: updatedReceipts };
    });
  },

  getReceipt: (id) => {
    return get().receipts.find((receipt) => receipt.id === id);
  },

  deleteReceipt: (id) => {
    set((state) => {
      const updatedReceipts = state.receipts.filter((receipt) => receipt.id !== id);
      saveReceipts(updatedReceipts);
      return { receipts: updatedReceipts };
    });
  },
}));