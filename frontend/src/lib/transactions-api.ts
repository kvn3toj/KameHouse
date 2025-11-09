import { api } from './api';
import type {
  Transaction,
  CreateTransactionDto,
  BalanceHistoryEntry,
  UserBalance,
  TransactionStatus,
} from '@/types/transaction';

export const transactionsApi = {
  /**
   * Create a favor request
   */
  create: async (householdId: string, data: CreateTransactionDto): Promise<Transaction> => {
    return api.post<Transaction>(`/transactions/${householdId}`, data);
  },

  /**
   * Accept an open favor request
   */
  accept: async (householdId: string, transactionId: string): Promise<Transaction> => {
    return api.post<Transaction>(`/transactions/${householdId}/${transactionId}/accept`);
  },

  /**
   * Complete a task
   */
  complete: async (householdId: string, transactionId: string): Promise<Transaction> => {
    return api.post<Transaction>(`/transactions/${householdId}/${transactionId}/complete`);
  },

  /**
   * Decline a task
   */
  decline: async (householdId: string, transactionId: string): Promise<void> => {
    return api.post<void>(`/transactions/${householdId}/${transactionId}/decline`);
  },

  /**
   * Cancel a task
   */
  cancel: async (householdId: string, transactionId: string): Promise<void> => {
    return api.delete<void>(`/transactions/${householdId}/${transactionId}`);
  },

  /**
   * Get all transactions for household
   */
  getAll: async (householdId: string, status?: TransactionStatus): Promise<Transaction[]> => {
    const url = status
      ? `/transactions/${householdId}?status=${status}`
      : `/transactions/${householdId}`;
    return api.get<Transaction[]>(url);
  },

  /**
   * Get my balance
   */
  getMyBalance: async (householdId: string): Promise<UserBalance> => {
    return api.get<UserBalance>(`/transactions/${householdId}/balance/me`);
  },

  /**
   * Get my balance history
   */
  getMyHistory: async (householdId: string): Promise<BalanceHistoryEntry[]> => {
    return api.get<BalanceHistoryEntry[]>(`/transactions/${householdId}/history/me`);
  },
};
