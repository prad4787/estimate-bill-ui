import { create } from 'zustand';
import { Client } from '../types';

const STORAGE_KEY = 'billmanager-clients';
const VIEW_PREFERENCE_KEY = 'billmanager-view-preference';

interface ClientState {
  clients: Client[];
  loading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  fetchClients: () => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClient: (id: string) => Client | undefined;
  setViewMode: (mode: 'grid' | 'list') => void;
}

// Load clients from localStorage
const loadClients = (): Client[] => {
  try {
    const storedClients = localStorage.getItem(STORAGE_KEY);
    return storedClients ? JSON.parse(storedClients) : [];
  } catch (error) {
    console.error('Failed to load clients from localStorage', error);
    return [];
  }
};

// Save clients to localStorage
const saveClients = (clients: Client[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  } catch (error) {
    console.error('Failed to save clients to localStorage', error);
  }
};

// Load view preference from localStorage
const loadViewPreference = (): 'grid' | 'list' => {
  try {
    const preference = localStorage.getItem(VIEW_PREFERENCE_KEY);
    return preference === 'list' ? 'list' : 'grid';
  } catch {
    return 'grid';
  }
};

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  loading: false,
  error: null,
  viewMode: loadViewPreference(),
  
  fetchClients: () => {
    set({ loading: true, error: null });
    try {
      const clients = loadClients();
      set({ clients, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch clients', loading: false });
    }
  },
  
  addClient: (clientData) => {
    const now = new Date().toISOString();
    const id = `client_${Date.now()}`;
    
    const newClient: Client = {
      id,
      ...clientData,
      createdAt: now,
      updatedAt: now,
    };
    
    set((state) => {
      const updatedClients = [...state.clients, newClient];
      saveClients(updatedClients);
      return { clients: updatedClients };
    });
    
    return id;
  },
  
  updateClient: (id, clientData) => {
    set((state) => {
      const index = state.clients.findIndex((client) => client.id === id);
      
      if (index === -1) {
        return { error: `Client with ID ${id} not found` };
      }
      
      const updatedClients = [...state.clients];
      updatedClients[index] = {
        ...updatedClients[index],
        ...clientData,
        updatedAt: new Date().toISOString(),
      };
      
      saveClients(updatedClients);
      return { clients: updatedClients };
    });
  },
  
  deleteClient: (id) => {
    set((state) => {
      const updatedClients = state.clients.filter((client) => client.id !== id);
      saveClients(updatedClients);
      return { clients: updatedClients };
    });
  },
  
  getClient: (id) => {
    return get().clients.find((client) => client.id === id);
  },

  setViewMode: (mode) => {
    localStorage.setItem(VIEW_PREFERENCE_KEY, mode);
    set({ viewMode: mode });
  },
}));