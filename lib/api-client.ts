import axios, { AxiosResponse } from "axios";

// Type definitions
export interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
  balance: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionEntry {
  id: number;
  transactionId: number;
  accountId: number;
  debit: number;
  credit: number;
  createdAt: string;
  account: Account;
}

export interface Transaction {
  id: number;
  date: string | Date;
  description: string;
  reference?: string;
  createdAt: string;
  updatedAt: string;
  entries: TransactionEntry[];
}

export interface UpdateTransactionData {
  date: string;
  description: string;
  entries: Array<{
    accountId: number;
    debit: number;
    credit: number;
  }>;
  reference?: string;
}


export interface CreateTransactionData {
  date: string | Date;
  description: string;
  entries: Array<{
    accountId: number;
    debit: number;
    credit: number;
  }>;
  reference?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: Pagination;
}

export interface JournalEntry {
  transactionId: number;
  date: string;
  description: string;
  reference?: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface JournalResponse {
  journalEntries: JournalEntry[];
  pagination: Pagination;
}

export interface AccountBalance {
  id: number;
  code: string;
  name: string;
  type: string;
  balance: number;
}

export interface BalanceSheetResponse {
  asOfDate: string;
  accountBalances: AccountBalance[];
  groupedBalances: {
    assets: AccountBalance[];
    liabilities: AccountBalance[];
    equity: AccountBalance[];
    revenue: AccountBalance[];
    expenses: AccountBalance[];
  };
  totals: {
    assets: number;
    liabilities: number;
    equity: number;
    revenue: number;
    expenses: number;
    netIncome: number;
    equityWithNetIncome: number;
  };
  accountingEquation: {
    assets: number;
    liabilities: number;
    equity: number;
    balances: boolean;
  };
}

export interface IncomeStatementResponse {
  period: {
    start: string;
    end: string;
  };
  revenues: {
    accounts: Array<{
      id: number;
      code: string;
      name: string;
      type: string;
      periodBalance: number;
    }>;
    total: number;
  };
  expenses: {
    accounts: Array<{
      id: number;
      code: string;
      name: string;
      type: string;
      periodBalance: number;
    }>;
    total: number;
  };
  netIncome: number;
  profitMargin: number;
}

// Create axios instance with proper typing
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to return only data
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    const message =
      error.response?.data?.error || error.message || "An error occurred";
    return Promise.reject(new Error(message));
  }
);

// API methods with proper typing
export const api = {
  // Accounts
  accounts: {
    getAll: (type?: string): Promise<Account[]> =>
      apiClient.get(`/accounts${type ? `?type=${type}` : ""}`),
    getById: (id: number): Promise<Account> => apiClient.get(`/accounts/${id}`),
    create: (data: Partial<Account>): Promise<Account> =>
      apiClient.post("/accounts", data),
    update: (id: number, data: Partial<Account>): Promise<Account> =>
      apiClient.put(`/accounts/${id}`, data),
    delete: (id: number): Promise<{ message: string }> =>
      apiClient.delete(`/accounts/${id}`),
  },

  // Transactions
  transactions: {
    getAll: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      startDate?: string;
      endDate?: string;
    }): Promise<TransactionsResponse> =>
      apiClient.get("/transactions", { params }),

    getById: (id: number): Promise<Transaction> =>
      apiClient.get(`/transactions/${id}`),

    create: (data: CreateTransactionData): Promise<Transaction> =>
      apiClient.post("/transactions", data),

    update: (id: number, data: UpdateTransactionData): Promise<Transaction> =>
      apiClient.put(`/transactions/${id}`, data),

    delete: (id: number): Promise<{ message: string }> =>
      apiClient.delete(`/transactions/${id}`),
  },

  // Reports
  reports: {
    balanceSheet: (asOfDate?: string): Promise<BalanceSheetResponse> =>
      apiClient.get("/reports/balance-sheet", { params: { asOfDate } }),

    incomeStatement: (
      startDate?: string,
      endDate?: string
    ): Promise<IncomeStatementResponse> =>
      apiClient.get("/reports/income-statement", {
        params: { startDate, endDate },
      }),

    journal: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      startDate?: string;
      endDate?: string;
    }): Promise<JournalResponse> =>
      apiClient.get("/reports/journal", { params }),
  },

  // Utils
  utils: {
    health: (): Promise<{
      status: string;
      timestamp: string;
      database: string;
      stats: {
        accounts: number;
        transactions: number;
        entries: number;
      };
    }> => apiClient.get("/utils"),
  },
};
