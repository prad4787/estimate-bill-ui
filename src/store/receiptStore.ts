import { create } from "zustand";
import { Receipt, ReceiptFormData, ApiError, Pagination } from "../types";
import { api } from "../api/instance";

interface ReceiptState {
  receipts: Receipt[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  currentReceipt: Receipt | null;
  currentReceiptLoading: boolean;
  currentReceiptError: string | null;
  fetchReceipts: (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    clientId?: string;
  }) => Promise<void>;
  addReceipt: (data: ReceiptFormData) => Promise<Receipt>;
  updateReceipt: (
    id: string,
    data: Partial<Receipt>
  ) => Promise<Receipt | null>;
  deleteReceipt: (id: number) => Promise<boolean>;
  getReceipt: (id: string) => Promise<Receipt | null>;
}

export const useReceiptStore = create<ReceiptState>((set) => ({
  receipts: [],
  loading: false,
  error: null,
  pagination: null,
  currentReceipt: null,
  currentReceiptLoading: false,
  currentReceiptError: null,

  fetchReceipts: async ({
    page = 1,
    limit = 10,
    startDate,
    endDate,
    clientId,
  } = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(clientId && { clientId }),
      });

      const res = await api.get<{ data: Receipt[]; pagination: Pagination }>(
        `/receipts?${queryParams.toString()}`
      );
      set({
        receipts: res.data.data,
        pagination: res.data.pagination,
        loading: false,
      });
    } catch (error: unknown) {
      let message = "Failed to fetch receipts";
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

  addReceipt: async (data: ReceiptFormData): Promise<Receipt> => {
    try {
      const res = await api.post<{ data: Receipt }, ReceiptFormData>(
        "/receipts",
        data
      );
      set((state) => ({ receipts: [...state.receipts, res.data.data] }));
      return res.data.data;
    } catch (error: unknown) {
      throw error as ApiError;
    }
  },

  updateReceipt: async (id: string, data: Partial<Receipt>) => {
    try {
      const res = await api.put<{ data: Receipt }, Partial<Receipt>>(
        `/receipts/${id}`,
        data
      );
      set((state) => ({
        receipts: state.receipts.map((r) => (r.id === +id ? res.data.data : r)),
      }));
      return res.data.data;
    } catch (error: unknown) {
      throw error as ApiError;
    }
  },

  deleteReceipt: async (id: number) => {
    try {
      await api.delete(`/receipts/${id}`);
      set((state) => ({
        receipts: state.receipts.filter((r) => r.id !== +id),
      }));
      return true;
    } catch (error: unknown) {
      throw error as ApiError;
    }
  },

  getReceipt: async (id: string): Promise<Receipt | null> => {
    set({ currentReceiptLoading: true, currentReceiptError: null });
    try {
      const res = await api.get<{ data: Receipt }>(`/receipts/${id}`);
      set({ currentReceipt: res.data.data, currentReceiptLoading: false });
      return res.data.data;
    } catch (error: unknown) {
      let message = "Failed to fetch receipt";
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
      ) {
        message = (error as { message: string }).message;
      }
      set({ currentReceiptError: message, currentReceiptLoading: false });
      return null;
    }
  },
}));
