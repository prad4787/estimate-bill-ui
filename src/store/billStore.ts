import { create } from 'zustand';
import { Bill } from '../types';

const STORAGE_KEY = 'billmanager-bills';

// Generate mock bills data
const generateMockBills = (): Bill[] => {
  const mockBills: Bill[] = [];
  const clientNames = [
    'Acme Corporation', 'TechStart Solutions', 'Global Enterprises Ltd', 'Creative Design Studio',
    'Manufacturing Plus Inc', 'Retail Chain Co', 'Healthcare Systems LLC', 'Education First Academy',
    'Financial Services Group', 'Green Energy Solutions', 'Food & Beverage Corp', 'Transportation Logistics',
    'Real Estate Ventures', 'Sports & Recreation Ltd', 'Media & Entertainment Inc', 'Construction Builders Co',
    'Consulting Experts LLC', 'Insurance Partners Group', 'Pharmaceutical Research', 'Automotive Solutions Inc',
    'Fashion Forward Brands', 'Travel & Tourism Agency', 'Security Systems Pro', 'Environmental Services',
    'Software Development Hub', 'Digital Marketing Agency', 'Legal Services Firm', 'Accounting Solutions',
    'Architecture Studio', 'Engineering Consultants'
  ];

  const getRandomDate = (monthsAgo: number, variance: number = 0) => {
    const now = new Date();
    const baseDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, now.getDate());
    const varianceDays = variance * 30; // Convert months to days
    const randomDays = Math.floor(Math.random() * varianceDays * 2) - varianceDays;
    baseDate.setDate(baseDate.getDate() + randomDays);
    return baseDate.toISOString();
  };

  const getRandomAmount = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const getRandomClient = () => {
    return clientNames[Math.floor(Math.random() * clientNames.length)];
  };

  const generateBillNumber = (index: number) => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const number = String(index + 1).padStart(4, '0');
    return `BILL/${year}/${month}/${number}`;
  };

  // Generate bills for different aging periods
  const agingPeriods = [
    { months: 0.5, count: 15 }, // Current (0-1 month)
    { months: 2, count: 20 },   // 1-3 months
    { months: 4.5, count: 25 }, // 3-6 months
    { months: 9, count: 20 },   // 6-12 months
    { months: 18, count: 20 }   // 12+ months
  ];

  let billIndex = 0;

  agingPeriods.forEach(period => {
    for (let i = 0; i < period.count; i++) {
      const clientName = getRandomClient();
      const issueDate = getRandomDate(period.months, 1);
      const issueDateObj = new Date(issueDate);
      const dueDate = new Date(issueDateObj);
      dueDate.setDate(dueDate.getDate() + 30); // 30 days payment terms

      const amount = getRandomAmount(500, 50000);
      const paidPercentage = Math.random();
      let paidAmount = 0;
      let status: Bill['status'] = 'unpaid';

      // Determine payment status based on age and randomness
      if (period.months < 1) {
        // Recent bills - mostly unpaid or partial
        if (paidPercentage < 0.7) {
          status = 'unpaid';
        } else if (paidPercentage < 0.9) {
          status = 'partial';
          paidAmount = Math.floor(amount * (0.2 + Math.random() * 0.6));
        } else {
          status = 'paid';
          paidAmount = amount;
        }
      } else if (period.months < 3) {
        // 1-3 months - mix of statuses
        if (paidPercentage < 0.6) {
          status = 'overdue';
        } else if (paidPercentage < 0.8) {
          status = 'partial';
          paidAmount = Math.floor(amount * (0.1 + Math.random() * 0.7));
        } else {
          status = 'paid';
          paidAmount = amount;
        }
      } else {
        // Older bills - mostly overdue or partial
        if (paidPercentage < 0.8) {
          status = 'overdue';
        } else {
          status = 'partial';
          paidAmount = Math.floor(amount * (0.1 + Math.random() * 0.5));
        }
      }

      const remainingAmount = amount - paidAmount;

      mockBills.push({
        id: `bill_${billIndex + 1}`,
        billNumber: generateBillNumber(billIndex),
        clientId: `client_${Math.floor(Math.random() * 25) + 1}`,
        clientName,
        issueDate,
        dueDate: dueDate.toISOString(),
        amount,
        paidAmount,
        remainingAmount,
        status,
        createdAt: issueDate,
        updatedAt: issueDate
      });

      billIndex++;
    }
  });

  return mockBills.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
};

interface BillState {
  bills: Bill[];
  loading: boolean;
  error: string | null;
  fetchBills: () => void;
  getUnpaidBills: () => Bill[];
  getAgingReport: () => {
    current: Bill[];
    oneToThree: Bill[];
    threeToSix: Bill[];
    sixToTwelve: Bill[];
    overTwelve: Bill[];
  };
}

// Load bills from localStorage
const loadBills = (): Bill[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.length === 0) {
        const mockBills = generateMockBills();
        saveBills(mockBills);
        return mockBills;
      }
      return parsed;
    } else {
      const mockBills = generateMockBills();
      saveBills(mockBills);
      return mockBills;
    }
  } catch (error) {
    console.error('Failed to load bills from localStorage', error);
    const mockBills = generateMockBills();
    saveBills(mockBills);
    return mockBills;
  }
};

// Save bills to localStorage
const saveBills = (bills: Bill[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
  } catch (error) {
    console.error('Failed to save bills to localStorage', error);
  }
};

export const useBillStore = create<BillState>((set, get) => ({
  bills: [],
  loading: false,
  error: null,

  fetchBills: () => {
    set({ loading: true, error: null });
    try {
      const bills = loadBills();
      set({ bills, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch bills', loading: false });
    }
  },

  getUnpaidBills: () => {
    const bills = get().bills;
    return bills.filter(bill => bill.status !== 'paid' && bill.remainingAmount > 0);
  },

  getAgingReport: () => {
    const unpaidBills = get().getUnpaidBills();
    const now = new Date();

    const current: Bill[] = [];
    const oneToThree: Bill[] = [];
    const threeToSix: Bill[] = [];
    const sixToTwelve: Bill[] = [];
    const overTwelve: Bill[] = [];

    unpaidBills.forEach(bill => {
      const dueDate = new Date(bill.dueDate);
      const daysPastDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysPastDue <= 30) {
        current.push(bill);
      } else if (daysPastDue <= 90) {
        oneToThree.push(bill);
      } else if (daysPastDue <= 180) {
        threeToSix.push(bill);
      } else if (daysPastDue <= 365) {
        sixToTwelve.push(bill);
      } else {
        overTwelve.push(bill);
      }
    });

    return {
      current,
      oneToThree,
      threeToSix,
      sixToTwelve,
      overTwelve
    };
  }
}));