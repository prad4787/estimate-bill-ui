import { create } from "zustand";
import {
  Stock,
  StockFormData,
  ApiError,
  Pagination,
  ApiResponse,
} from "../types";
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

interface StockResponse {
  data: Stock;
}

interface StockStatsResponse {
  data: {
    total: number;
    tracked: number;
    untracked: number;
    lowStock: number;
    outOfStock: number;
  };
}

export const useStockStore = create<StockState>((set) => ({
  stocks: [],
  loading: false,
  error: null,
  pagination: null,
  stats: null,

  fetchStocks: async (search = "", page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<ApiResponse<Stock[]>>(
        `/stocks?search=${search}&page=${page}&limit=${limit}`
      );

      console.log({ res });
      if (res.success) {
        set({
          stocks: res.data,
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
      const res = await api.get<StockStatsResponse>("/stocks/stats");
      if (res.success) {
        set({ stats: res.data.data });
      } else {
        set({ error: res.message || "Failed to fetch stock stats" });
      }
    } catch (error) {
      console.error("Error fetching stock stats:", error);
      set({ error: "Failed to fetch stock stats" });
    }
  },

  addStock: async (stockData): Promise<Stock> => {
    try {
      const res = await api.post<ApiResponse<Stock>, StockFormData>(
        "/stocks",
        stockData
      );
      if (res.success) {
        set((state) => ({ stocks: [...state.stocks, res.data.data] }));
        return res.data.data;
      } else {
        throw new Error(res.message || "Failed to create stock");
      }
    } catch (error) {
      throw error as ApiError;
    }
  },

  updateStock: async (id, stockData) => {
    try {
      const res = await api.put<StockResponse, Partial<Stock>>(
        `/stocks/${id}`,
        stockData
      );
      if (res.success) {
        set((state) => ({
          stocks: state.stocks.map((s) => (s.id === id ? res.data.data : s)),
        }));
        return res.data.data;
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
      const res = await api.get<StockResponse>(`/stocks/${id}`);
      if (res.success) {
        return res.data.data;
      } else {
        throw new Error(res.message || "Failed to fetch stock");
      }
    } catch (error) {
      throw error as ApiError;
    }
  },
}));
