import { create } from "zustand";
import { Stock, StockFormData, ApiError, Pagination } from "../types";
import { api } from "../api/instance";

interface StockState {
  stocks: Stock[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  stats: {
    total: number;
    tracked: number;
    untracked: number;
    lowStock: number;
    outOfStock: number;
  } | null;
  fetchStocks: (
    search?: string,
    page?: number,
    limit?: number
  ) => Promise<void>;
  fetchStockStats: () => Promise<void>;
  addStock: (stock: StockFormData) => Promise<Stock>;
  updateStock: (id: string, stock: Partial<Stock>) => Promise<Stock | null>;
  deleteStock: (id: string) => Promise<boolean>;
  getStock: (id: string) => Promise<Stock | null>;
}

export const useStockStore = create<StockState>((set, get) => ({
  stocks: [],
  loading: false,
  error: null,
  pagination: null,
  stats: null,

  fetchStocks: async (search = "", page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<Stock[]>(
        `/stocks?search=${search}&page=${page}&limit=${limit}`
      );
      set({
        stocks: res.data,
        pagination: res.pagination,
        loading: false,
      });
    } catch (error: unknown) {
      let message = "Failed to fetch stocks";
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
      ) {
        message = (error as { message: string }).message;
      }
      set({ error: message, loading: false });
    }
  },

  fetchStockStats: async () => {
    try {
      const res = await api.get<{
        total: number;
        tracked: number;
        untracked: number;
        lowStock: number;
        outOfStock: number;
      }>("/stocks/stats");
      set({ stats: res.data });
    } catch (error: unknown) {
      let message = "Failed to fetch stock stats";
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
      ) {
        message = (error as { message: string }).message;
      }
      set({ error: message });
    }
  },

  addStock: async (stockData): Promise<Stock> => {
    try {
      const res = await api.post<Stock, StockFormData>("/stocks", stockData);
      set((state) => ({ stocks: [...state.stocks, res.data] }));
      return res.data;
    } catch (error: unknown) {
      throw error as ApiError;
    }
  },

  updateStock: async (id, stockData) => {
    try {
      const res = await api.put<Stock, Partial<Stock>>(
        `/stocks/${id}`,
        stockData
      );
      set((state) => ({
        stocks: state.stocks.map((s) => (s.id === id ? res.data : s)),
      }));
      return res.data;
    } catch {
      return null;
    }
  },

  deleteStock: async (id) => {
    try {
      await api.delete(`/stocks/${id}`);
      set((state) => ({ stocks: state.stocks.filter((s) => s.id !== id) }));
      return true;
    } catch {
      return false;
    }
  },

  getStock: async (id) => {
    try {
      const res = await api.get<Stock>(`/stocks/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },
}));
