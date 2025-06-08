import { create } from 'zustand';
import { Stock, StockFormData } from '../types';

const STORAGE_KEY = 'billmanager-stock';

interface StockState {
  stocks: Stock[];
  loading: boolean;
  error: string | null;
  fetchStocks: () => void;
  addStock: (stock: Omit<Stock, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateStock: (id: string, stock: Partial<Stock>) => void;
  deleteStock: (id: string) => void;
  getStock: (id: string) => Stock | undefined;
}

// Load stocks from localStorage
const loadStocks = (): Stock[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load stocks from localStorage', error);
    return [];
  }
};

// Save stocks to localStorage
const saveStocks = (stocks: Stock[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stocks));
  } catch (error) {
    console.error('Failed to save stocks to localStorage', error);
  }
};

export const useStockStore = create<StockState>((set, get) => ({
  stocks: [],
  loading: false,
  error: null,
  
  fetchStocks: () => {
    set({ loading: true, error: null });
    try {
      const stocks = loadStocks();
      set({ stocks, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch stocks', loading: false });
    }
  },
  
  addStock: (stockData) => {
    const now = new Date().toISOString();
    const id = `stock_${Date.now()}`;
    
    const newStock: Stock = {
      id,
      ...stockData,
      createdAt: now,
      updatedAt: now,
    };
    
    set((state) => {
      const updatedStocks = [...state.stocks, newStock];
      saveStocks(updatedStocks);
      return { stocks: updatedStocks };
    });
    
    return id;
  },
  
  updateStock: (id, stockData) => {
    set((state) => {
      const index = state.stocks.findIndex((stock) => stock.id === id);
      
      if (index === -1) {
        return { error: `Stock with ID ${id} not found` };
      }
      
      const updatedStocks = [...state.stocks];
      updatedStocks[index] = {
        ...updatedStocks[index],
        ...stockData,
        updatedAt: new Date().toISOString(),
      };
      
      saveStocks(updatedStocks);
      return { stocks: updatedStocks };
    });
  },
  
  deleteStock: (id) => {
    set((state) => {
      const updatedStocks = state.stocks.filter((stock) => stock.id !== id);
      saveStocks(updatedStocks);
      return { stocks: updatedStocks };
    });
  },
  
  getStock: (id) => {
    return get().stocks.find((stock) => stock.id === id);
  },
}));