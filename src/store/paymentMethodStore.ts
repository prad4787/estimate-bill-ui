import { create } from "zustand";
import {
  ApiError,
  PaymentMethod,
  PaymentMethodFormData,
  Pagination,
} from "../types";
import { api } from "../api/instance";

interface PaymentMethodState {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  currentMethod: PaymentMethod | null;
  currentMethodLoading: boolean;
  currentMethodError: string | null;
  fetchPaymentMethods: (page?: number, limit?: number) => Promise<void>;
  addPaymentMethod: (data: PaymentMethodFormData) => Promise<PaymentMethod>;
  updatePaymentMethod: (
    id: string,
    data: PaymentMethodFormData
  ) => Promise<PaymentMethod | null>;
  deletePaymentMethod: (id: string) => Promise<boolean>;
  getPaymentMethod: (id: string) => Promise<PaymentMethod | null>;
  updateBalance: (id: string, amount: number) => Promise<PaymentMethod | null>;
}

export const usePaymentMethodStore = create<PaymentMethodState>((set) => ({
  paymentMethods: [],
  loading: false,
  error: null,
  pagination: null,
  currentMethod: null,
  currentMethodLoading: false,
  currentMethodError: null,

  fetchPaymentMethods: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<PaymentMethod[]>(
        `/payment-methods?page=${page}&limit=${limit}`
      );
      set({
        paymentMethods: res.data,
        pagination: res.pagination,
        loading: false,
      });
    } catch (error: unknown) {
      let message = "Failed to fetch payment methods";
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

  addPaymentMethod: async (
    data: PaymentMethodFormData
  ): Promise<PaymentMethod> => {
    try {
      const res = await api.post<PaymentMethod, PaymentMethodFormData>(
        `/payment-methods`,
        data
      );
      set((state) => ({ paymentMethods: [...state.paymentMethods, res.data] }));
      return res.data;
    } catch (error: unknown) {
      throw error as ApiError;
    }
  },

  updatePaymentMethod: async (id: string, data: PaymentMethodFormData) => {
    try {
      const res = await api.put<PaymentMethod, PaymentMethodFormData>(
        `/payment-methods/${id}`,
        data
      );
      set((state) => ({
        paymentMethods: state.paymentMethods.map((m) =>
          m.id === id ? res.data : m
        ),
      }));
      return res.data;
    } catch (error: unknown) {
      throw error as ApiError;
    }
  },

  deletePaymentMethod: async (id: string) => {
    try {
      await api.delete(`/payment-methods/${id}`);
      set((state) => ({
        paymentMethods: state.paymentMethods.filter((m) => m.id !== id),
      }));
      return true;
    } catch (error: unknown) {
      throw error as ApiError;
    }
  },

  getPaymentMethod: async (id: string): Promise<PaymentMethod | null> => {
    set({ currentMethodLoading: true, currentMethodError: null });
    try {
      const res = await api.get<PaymentMethod>(`/payment-methods/${id}`);
      set({ currentMethod: res.data, currentMethodLoading: false });
      return res.data;
    } catch (error: unknown) {
      let message = "Failed to fetch payment method";
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
      ) {
        message = (error as { message: string }).message;
      }
      set({ currentMethodError: message, currentMethodLoading: false });
      return null;
    }
  },

  updateBalance: async (id: string, amount: number) => {
    try {
      const res = await api.put<PaymentMethod, { amount: number }>(
        `/payment-methods/${id}/balance`,
        { amount }
      );
      set((state) => ({
        paymentMethods: state.paymentMethods.map((m) =>
          m.id === id ? res.data : m
        ),
      }));
      return res.data;
    } catch (error: unknown) {
      throw error as ApiError;
    }
  },
}));
