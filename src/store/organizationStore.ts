import { create } from "zustand";
import { OrganizationInfo } from "../types";
import { api } from "../api/instance";

interface OrganizationState {
  organization: OrganizationInfo | null;
  loading: boolean;
  error: string | null;
  fetchOrganization: () => Promise<void>;
  updateOrganization: (
    data: Partial<OrganizationInfo & { phones?: string[]; emails?: string[] }>
  ) => Promise<void>;
  uploadLogo: (file: File) => Promise<string>;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  organization: null,
  loading: false,
  error: null,

  fetchOrganization: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<OrganizationInfo>("/organization");
      set({ organization: res.data, loading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch organization data";
      set({ error: message, loading: false });
    }
  },

  updateOrganization: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put<OrganizationInfo, Partial<OrganizationInfo>>(
        "/organization",
        data
      );
      set({ organization: res.data, loading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update organization";
      set({ error: message, loading: false });
      throw error;
    }
  },

  uploadLogo: async (file: File) => {
    const formData = new FormData();
    formData.append("logo", file);
    try {
      const res = await api.post("/organization/logo", formData);
      const data = res.data as { logoUrl: string };
      set((state) => ({
        organization: state.organization
          ? { ...state.organization, logo: data.logoUrl }
          : state.organization,
      }));
      return data.logoUrl;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to upload logo";
      set({ error: message });
      throw error;
    }
  },
}));
