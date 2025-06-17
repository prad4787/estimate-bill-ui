import { create } from "zustand";
import { Stock, StockFormData, ApiError, Pagination, BillItem } from "../types";
import { api } from "../api/instance";

interface StockBillItem extends BillItem {
  bill?: {
    number: string;
    date: string;
  };
}

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
  stockBillItems: {
    data: StockBillItem[];
    pagination: Pagination | null;
  };
  fetchStocks: (
    search?: string,
    page?: number,
    limit?: number
  ) => Promise<void>;
  fetchStockStats: () => Promise<void>;
  fetchStockBillItems: (
    stockId: string,
    page?: number,
    limit?: number
  ) => Promise<void>;
  addStock: (stock: StockFormData) => Promise<Stock>;
  updateStock: (id: string, stock: Partial<Stock>) => Promise<Stock | null>;
  deleteStock: (id: string) => Promise<boolean>;
  getStock: (id: string) => Promise<Stock | null>;
}

export const useStockStore = create<StockState>((set) => ({
  stocks: [],
  loading: false,
  error: null,
  pagination: null,
  stats: null,
  stockBillItems: {
    data: [],
    pagination: null,
  },

  fetchStocks: async (search = "", page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<Stock[]>(
        `/stocks?search=${search}&page=${page}&limit=${limit}`
      );

      if (res.success) {
        set({
          stocks: res.data as Stock[],
          pagination: res.pagination,
          loading: false,
        });
      } else {
        set({
          error: res.message || "Failed to fetch stocks",
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
      set({ error: "Failed to fetch stocks", loading: false });
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
      if (res.success) {
        set({
          stats: res.data as {
            total: number;
            tracked: number;
            untracked: number;
            lowStock: number;
            outOfStock: number;
          },
        });
      } else {
        set({ error: res.message || "Failed to fetch stock stats" });
      }
    } catch (error) {
      console.error("Error fetching stock stats:", error);
      set({ error: "Failed to fetch stock stats" });
    }
  },

  fetchStockBillItems: async (stockId, page = 1, limit = 10) => {
    try {
      const res = await api.get<StockBillItem[]>(
        `/stocks/${stockId}/bill-items?page=${page}&limit=${limit}`
      );
      if (res.success) {
        set({
          stockBillItems: {
            data: res.data as StockBillItem[],
            pagination: res.pagination || null,
          },
        });
      } else {
        throw new Error(res.message || "Failed to fetch stock bill items");
      }
    } catch (error) {
      console.error("Error fetching stock bill items:", error);
      set({ error: "Failed to fetch stock bill items" });
    }
  },

  addStock: async (stockData): Promise<Stock> => {
    try {
      const res = await api.post<Stock, StockFormData>("/stocks", stockData);
      if (res.success) {
        const newStock = res.data as Stock;
        set((state) => ({ stocks: [...state.stocks, newStock] }));
        return newStock;
      } else {
        throw new Error(res.message || "Failed to create stock");
      }
    } catch (error) {
      throw error as ApiError;
    }
  },

  updateStock: async (id, stockData) => {
    try {
      const res = await api.put<Stock, Partial<Stock>>(
        `/stocks/${id}`,
        stockData
      );
      if (res.success) {
        const updatedStock = res.data as Stock;
        set((state) => ({
          stocks: state.stocks.map((s) => (s.id === id ? updatedStock : s)),
        }));
        return updatedStock;
      } else {
        throw new Error(res.message || "Failed to update stock");
      }
    } catch (error) {
      throw error as ApiError;
    }
  },

  deleteStock: async (id) => {
    try {
      const res = await api.delete<{ message: string }>(`/stocks/${id}`);
      if (res.success) {
        set((state) => ({ stocks: state.stocks.filter((s) => s.id !== id) }));
        return true;
      } else {
        throw new Error(res.message || "Failed to delete stock");
      }
    } catch (error) {
      throw error as ApiError;
    }
  },

  getStock: async (id) => {
    try {
      const res = await api.get<Stock>(`/stocks/${id}`);
      if (res.success) {
        return res.data as Stock;
      } else {
        throw new Error(res.message || "Failed to fetch stock");
      }
    } catch (error) {
      throw error as ApiError;
    }
  },
}));
