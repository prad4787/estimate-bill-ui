import { create } from 'zustand';
import { Client } from '../types';

const STORAGE_KEY = 'billmanager-clients';
const VIEW_PREFERENCE_KEY = 'billmanager-view-preference';

// Mock data for demonstration
const generateMockClients = (): Client[] => {
  const mockClients: Client[] = [
    {
      id: 'client_1',
      name: 'Acme Corporation',
      address: '123 Business Ave, Suite 100, New York, NY 10001',
      panVat: 'PAN123456789',
      openingBalance: 15000,
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-15T10:30:00.000Z',
    },
    {
      id: 'client_2',
      name: 'TechStart Solutions',
      address: '456 Innovation Drive, San Francisco, CA 94105',
      panVat: 'VAT987654321',
      openingBalance: 8500,
      createdAt: '2024-01-20T14:15:00.000Z',
      updatedAt: '2024-01-20T14:15:00.000Z',
    },
    {
      id: 'client_3',
      name: 'Global Enterprises Ltd',
      address: '789 Corporate Blvd, Chicago, IL 60601',
      panVat: 'PAN555666777',
      openingBalance: 22000,
      createdAt: '2024-01-25T09:45:00.000Z',
      updatedAt: '2024-01-25T09:45:00.000Z',
    },
    {
      id: 'client_4',
      name: 'Creative Design Studio',
      address: '321 Art Street, Los Angeles, CA 90210',
      panVat: 'VAT111222333',
      openingBalance: 5200,
      createdAt: '2024-02-01T16:20:00.000Z',
      updatedAt: '2024-02-01T16:20:00.000Z',
    },
    {
      id: 'client_5',
      name: 'Manufacturing Plus Inc',
      address: '654 Industrial Way, Detroit, MI 48201',
      panVat: 'PAN444555666',
      openingBalance: 18750,
      createdAt: '2024-02-05T11:30:00.000Z',
      updatedAt: '2024-02-05T11:30:00.000Z',
    },
    {
      id: 'client_6',
      name: 'Retail Chain Co',
      address: '987 Commerce Plaza, Miami, FL 33101',
      panVat: 'VAT777888999',
      openingBalance: 12300,
      createdAt: '2024-02-10T13:45:00.000Z',
      updatedAt: '2024-02-10T13:45:00.000Z',
    },
    {
      id: 'client_7',
      name: 'Healthcare Systems LLC',
      address: '147 Medical Center Dr, Houston, TX 77001',
      panVat: 'PAN123789456',
      openingBalance: 31500,
      createdAt: '2024-02-15T08:15:00.000Z',
      updatedAt: '2024-02-15T08:15:00.000Z',
    },
    {
      id: 'client_8',
      name: 'Education First Academy',
      address: '258 Learning Lane, Boston, MA 02101',
      panVat: 'VAT456123789',
      openingBalance: 7800,
      createdAt: '2024-02-20T15:30:00.000Z',
      updatedAt: '2024-02-20T15:30:00.000Z',
    },
    {
      id: 'client_9',
      name: 'Financial Services Group',
      address: '369 Money Street, Wall Street, NY 10005',
      panVat: 'PAN789456123',
      openingBalance: 45000,
      createdAt: '2024-02-25T12:00:00.000Z',
      updatedAt: '2024-02-25T12:00:00.000Z',
    },
    {
      id: 'client_10',
      name: 'Green Energy Solutions',
      address: '741 Renewable Ave, Portland, OR 97201',
      panVat: 'VAT321654987',
      openingBalance: 16200,
      createdAt: '2024-03-01T10:45:00.000Z',
      updatedAt: '2024-03-01T10:45:00.000Z',
    },
    {
      id: 'client_11',
      name: 'Food & Beverage Corp',
      address: '852 Culinary Circle, New Orleans, LA 70112',
      panVat: 'PAN654987321',
      openingBalance: 9750,
      createdAt: '2024-03-05T14:20:00.000Z',
      updatedAt: '2024-03-05T14:20:00.000Z',
    },
    {
      id: 'client_12',
      name: 'Transportation Logistics',
      address: '963 Highway Junction, Atlanta, GA 30301',
      panVat: 'VAT987321654',
      openingBalance: 28900,
      createdAt: '2024-03-10T09:30:00.000Z',
      updatedAt: '2024-03-10T09:30:00.000Z',
    },
    {
      id: 'client_13',
      name: 'Real Estate Ventures',
      address: '159 Property Plaza, Las Vegas, NV 89101',
      panVat: 'PAN159753486',
      openingBalance: 52000,
      createdAt: '2024-03-15T16:45:00.000Z',
      updatedAt: '2024-03-15T16:45:00.000Z',
    },
    {
      id: 'client_14',
      name: 'Sports & Recreation Ltd',
      address: '357 Athletic Avenue, Denver, CO 80201',
      panVat: 'VAT753159486',
      openingBalance: 11400,
      createdAt: '2024-03-20T11:15:00.000Z',
      updatedAt: '2024-03-20T11:15:00.000Z',
    },
    {
      id: 'client_15',
      name: 'Media & Entertainment Inc',
      address: '468 Studio Boulevard, Hollywood, CA 90028',
      panVat: 'PAN486159753',
      openingBalance: 19600,
      createdAt: '2024-03-25T13:30:00.000Z',
      updatedAt: '2024-03-25T13:30:00.000Z',
    },
    {
      id: 'client_16',
      name: 'Construction Builders Co',
      address: '579 Builder Street, Phoenix, AZ 85001',
      panVat: 'VAT159486753',
      openingBalance: 34500,
      createdAt: '2024-03-30T08:45:00.000Z',
      updatedAt: '2024-03-30T08:45:00.000Z',
    },
    {
      id: 'client_17',
      name: 'Consulting Experts LLC',
      address: '680 Advisory Lane, Seattle, WA 98101',
      panVat: 'PAN680357159',
      openingBalance: 13800,
      createdAt: '2024-04-01T15:00:00.000Z',
      updatedAt: '2024-04-01T15:00:00.000Z',
    },
    {
      id: 'client_18',
      name: 'Insurance Partners Group',
      address: '791 Coverage Court, Minneapolis, MN 55401',
      panVat: 'VAT357680159',
      openingBalance: 26700,
      createdAt: '2024-04-05T12:30:00.000Z',
      updatedAt: '2024-04-05T12:30:00.000Z',
    },
    {
      id: 'client_19',
      name: 'Pharmaceutical Research',
      address: '802 Science Park, Philadelphia, PA 19101',
      panVat: 'PAN802468135',
      openingBalance: 41200,
      createdAt: '2024-04-10T10:15:00.000Z',
      updatedAt: '2024-04-10T10:15:00.000Z',
    },
    {
      id: 'client_20',
      name: 'Automotive Solutions Inc',
      address: '913 Motor Mile, Detroit, MI 48202',
      panVat: 'VAT468802135',
      openingBalance: 17900,
      createdAt: '2024-04-15T14:45:00.000Z',
      updatedAt: '2024-04-15T14:45:00.000Z',
    },
    {
      id: 'client_21',
      name: 'Fashion Forward Brands',
      address: '124 Style Street, New York, NY 10013',
      panVat: 'PAN124579368',
      openingBalance: 8900,
      createdAt: '2024-04-20T09:20:00.000Z',
      updatedAt: '2024-04-20T09:20:00.000Z',
    },
    {
      id: 'client_22',
      name: 'Travel & Tourism Agency',
      address: '235 Vacation Vista, Orlando, FL 32801',
      panVat: 'VAT579124368',
      openingBalance: 14600,
      createdAt: '2024-04-25T16:30:00.000Z',
      updatedAt: '2024-04-25T16:30:00.000Z',
    },
    {
      id: 'client_23',
      name: 'Security Systems Pro',
      address: '346 Safety Square, Las Vegas, NV 89102',
      panVat: 'PAN346791258',
      openingBalance: 21300,
      createdAt: '2024-04-30T11:45:00.000Z',
      updatedAt: '2024-04-30T11:45:00.000Z',
    },
    {
      id: 'client_24',
      name: 'Environmental Services',
      address: '457 Green Valley Road, Portland, OR 97202',
      panVat: 'VAT791346258',
      openingBalance: 18500,
      createdAt: '2024-05-05T13:15:00.000Z',
      updatedAt: '2024-05-05T13:15:00.000Z',
    },
    {
      id: 'client_25',
      name: 'Software Development Hub',
      address: '568 Code Campus, Austin, TX 78701',
      panVat: 'PAN568924137',
      openingBalance: 32400,
      createdAt: '2024-05-10T08:30:00.000Z',
      updatedAt: '2024-05-10T08:30:00.000Z',
    }
  ];
  
  return mockClients;
};

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
    if (storedClients) {
      const parsed = JSON.parse(storedClients);
      // If no clients exist, add mock data
      if (parsed.length === 0) {
        const mockClients = generateMockClients();
        saveClients(mockClients);
        return mockClients;
      }
      return parsed;
    } else {
      // First time loading, add mock data
      const mockClients = generateMockClients();
      saveClients(mockClients);
      return mockClients;
    }
  } catch (error) {
    console.error('Failed to load clients from localStorage', error);
    // On error, return mock data
    const mockClients = generateMockClients();
    saveClients(mockClients);
    return mockClients;
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