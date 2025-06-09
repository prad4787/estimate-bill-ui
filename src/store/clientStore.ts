import { create } from "zustand";
import { ApiError, Client, Pagination } from "../types";
import { api } from "../api/instance";

interface ClientState {
  clients: Client[];
  loading: boolean;
  error: string | null;
  viewMode: "grid" | "list";
  pagination: Pagination | null;
  fetchClients: () => Promise<void>;
  addClient: (
    client: Omit<Client, "id" | "createdAt" | "updatedAt">
  ) => Promise<Client>;
  updateClient: (id: string, client: Partial<Client>) => Promise<Client | null>;
  deleteClient: (id: string) => Promise<boolean>;
  getClient: (id: string) => Client | undefined;
  setViewMode: (mode: "grid" | "list") => void;
}

const VIEW_PREFERENCE_KEY = "billmanager-view-preference";

const loadViewPreference = (): "grid" | "list" => {
  try {
    const preference = localStorage.getItem(VIEW_PREFERENCE_KEY);
    return preference === "list" ? "list" : "grid";
  } catch {
    return "grid";
  }
};

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  loading: false,
  error: null,
  viewMode: loadViewPreference(),
  pagination: null,

  fetchClients: async (
    search: string = "",
    page: number = 1,
    limit: number = 10
  ) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<Client[]>(
        `/clients?search=${search}&page=${page}&limit=${limit}`
      );
      set({
        clients: res.data,
        pagination: res.pagination,
        loading: false,
      });
    } catch (error: unknown) {
      let message = "Failed to fetch clients";
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

  addClient: async (clientData): Promise<Client> => {
    try {
      const res = await api.post<
        Client,
        Omit<Client, "id" | "createdAt" | "updatedAt">
      >(`/clients`, clientData);
      set((state) => ({ clients: [...state.clients, res.data] }));
      return res.data;
    } catch (error: unknown) {
      throw error as ApiError;
    }
  },

  updateClient: async (id, clientData) => {
    try {
      const res = await api.put<Client, Partial<Client>>(
        `/clients/${id}`,
        clientData
      );

      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? res.data : c)),
      }));
      return res.data;
    } catch {
      return null;
    }
  },

  deleteClient: async (id) => {
    try {
      await api.delete(`/clients/${id}`);
      set((state) => ({ clients: state.clients.filter((c) => c.id !== id) }));
      return true;
    } catch {
      return false;
    }
  },

  getClient: (id) => {
    return get().clients.find((client) => client.id === id);
  },

  setViewMode: (mode) => {
    localStorage.setItem(VIEW_PREFERENCE_KEY, mode);
    set({ viewMode: mode });
  },
}));
