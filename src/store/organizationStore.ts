import { create } from 'zustand';
import { OrganizationInfo } from '../types';

const STORAGE_KEY = 'billmanager-organization';

interface OrganizationState {
  organization: OrganizationInfo;
  loading: boolean;
  error: string | null;
  fetchOrganization: () => void;
  updateOrganization: (data: Partial<OrganizationInfo>) => void;
  uploadLogo: (file: File) => Promise<string>;
}

// Default organization data
const defaultOrganization: OrganizationInfo = {
  name: 'Your Company Name',
  address: 'Your Company Address',
  phones: ['+1 (555) 123-4567'],
  emails: ['info@yourcompany.com'],
  website: 'www.yourcompany.com',
  taxId: 'TAX123456789',
  registrationNumber: 'REG123456789'
};

// Load organization from localStorage
const loadOrganization = (): OrganizationInfo => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultOrganization, ...JSON.parse(stored) } : defaultOrganization;
  } catch (error) {
    console.error('Failed to load organization from localStorage', error);
    return defaultOrganization;
  }
};

// Save organization to localStorage
const saveOrganization = (organization: OrganizationInfo): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(organization));
  } catch (error) {
    console.error('Failed to save organization to localStorage', error);
  }
};

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  organization: defaultOrganization,
  loading: false,
  error: null,

  fetchOrganization: () => {
    set({ loading: true, error: null });
    try {
      const organization = loadOrganization();
      set({ organization, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch organization data', loading: false });
    }
  },

  updateOrganization: (data) => {
    const currentOrg = get().organization;
    const updatedOrg = { ...currentOrg, ...data };
    
    set({ organization: updatedOrg });
    saveOrganization(updatedOrg);
  },

  uploadLogo: async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const currentOrg = get().organization;
        const updatedOrg = { ...currentOrg, logo: result };
        
        set({ organization: updatedOrg });
        saveOrganization(updatedOrg);
        resolve(result);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },
}));