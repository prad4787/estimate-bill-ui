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
      const res = await api.get<Estimate[]>(
        `/bills?page=${page}&limit=${limit}&search=${search}`
      );
      if (res.success) {
        set({
          estimates: res.data,
          pagination: res.pagination,
          loading: false,
        });
      } else {
        set({
          error: res.message || "Failed to fetch estimates",
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching estimates:", error);
      set({ error: "Failed to fetch estimates", loading: false });
    }
  },

  addEstimate: async (data: EstimateFormData): Promise<Estimate> => {
    try {
      const res = await api.post<Estimate, EstimateFormData>("/bills", data);
      if (res.success) {
        set((state) => ({ estimates: [...state.estimates, res.data] }));
        return res.data;
      } else {
        throw new Error(res.message || "Failed to create estimate");
      }
    } catch (error) {
      throw error as ApiError;
    }
  },

  updateEstimate: async (id: string, data: Partial<Estimate>) => {
    try {
      const res = await api.put<Estimate, Partial<Estimate>>(
        `/bills/${id}`,
        data
      );
      if (res.success) {
        set((state) => ({
          estimates: state.estimates.map((e) => (e.id === id ? res.data : e)),
        }));
        return res.data;
      } else {
        throw new Error(res.message || "Failed to update estimate");
      }
    } catch (error) {
      throw error as ApiError;
    }
  },

  deleteEstimate: async (id: string) => {
    try {
      const res = await api.delete<{ message: string }>(`/bills/${id}`);
      if (res.success) {
        set((state) => ({
          estimates: state.estimates.filter((e) => e.id !== id),
        }));
        return true;
      } else {
        throw new Error(res.message || "Failed to delete estimate");
      }
    } catch (error) {
      throw error as ApiError;
    }
  },

  getEstimate: async (id: string): Promise<Estimate | null> => {
    set({ currentEstimateLoading: true, currentEstimateError: null });
    try {
      const res = await api.get<Estimate>(`/bills/${id}`);
      if (res.success) {
        set({ currentEstimate: res.data, currentEstimateLoading: false });
        return res.data;
      } else {
        set({
          currentEstimateError: res.message || "Failed to fetch estimate",
          currentEstimateLoading: false,
        });
        return null;
      }
    } catch (error) {
      console.error("Error fetching estimate:", error);
      set({
        currentEstimateError: "Failed to fetch estimate",
        currentEstimateLoading: false,
      });
      return null;
    }
  },
}));
