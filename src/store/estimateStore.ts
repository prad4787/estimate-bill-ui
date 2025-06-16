import { create } from "zustand";
import { Estimate, EstimateFormData, ApiError, Pagination } from "../types";
import { api } from "../api/instance";

interface EstimateState {
  estimates: Estimate[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  currentEstimate: Estimate | null;
  currentEstimateLoading: boolean;
  currentEstimateError: string | null;
  fetchEstimates: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => Promise<void>;
  addEstimate: (data: EstimateFormData) => Promise<Estimate>;
  updateEstimate: (
    id: string,
    data: Partial<Estimate>
  ) => Promise<Estimate | null>;
  deleteEstimate: (id: string) => Promise<boolean>;
  getEstimate: (id: string) => Promise<Estimate | null>;
}

export const useEstimateStore = create<EstimateState>((set) => ({
  estimates: [],
  loading: false,
  error: null,
  pagination: null,
  currentEstimate: null,
  currentEstimateLoading: false,
  currentEstimateError: null,

  fetchEstimates: async ({ page = 1, limit = 10, search = "" } = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const res = await api.get<{ data: Estimate[]; pagination: Pagination }>(
        `/estimates?${queryParams.toString()}`
      );
      set({
        estimates: res.data.data,
        pagination: res.data.pagination,
        loading: false,
      });
    } catch (error: unknown) {
      let message = "Failed to fetch estimates";
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

  addEstimate: async (data: EstimateFormData): Promise<Estimate> => {
    try {
      const res = await api.post<{ data: Estimate }, EstimateFormData>(
        "/estimates",
        data
      );
      set((state) => ({ estimates: [...state.estimates, res.data.data] }));
      return res.data.data;
    } catch (error: unknown) {
      throw error as ApiError;
    }
  },

  updateEstimate: async (id: string, data: Partial<Estimate>) => {
    try {
      const res = await api.put<{ data: Estimate }, Partial<Estimate>>(
        `/estimates/${id}`,
        data
      );
      set((state) => ({
        estimates: state.estimates.map((e) =>
          e.id === id ? res.data.data : e
        ),
      }));
      return res.data.data;
    } catch (error: unknown) {
      throw error as ApiError;
    }
  },

  deleteEstimate: async (id: string) => {
    try {
      await api.delete(`/estimates/${id}`);
      set((state) => ({
        estimates: state.estimates.filter((e) => e.id !== id),
      }));
      return true;
    } catch (error: unknown) {
      throw error as ApiError;
    }
  },

  getEstimate: async (id: string): Promise<Estimate | null> => {
    set({ currentEstimateLoading: true, currentEstimateError: null });
    try {
      const res = await api.get<{ data: Estimate }>(`/estimates/${id}`);
      set({ currentEstimate: res.data.data, currentEstimateLoading: false });
      return res.data.data;
    } catch (error: unknown) {
      let message = "Failed to fetch estimate";
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
      ) {
        message = (error as { message: string }).message;
      }
      set({ currentEstimateError: message, currentEstimateLoading: false });
      return null;
    }
  },
}));
