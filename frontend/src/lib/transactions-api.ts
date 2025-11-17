/**
 * Transactions API - PocketBase Implementation
 * PHOENIX-12 Phase 2F: Migrated from legacy localhost:3000 to PocketBase
 *
 * Collections used:
 * - transactions: LETS economy favor requests and credit tracking
 */

import { pb } from './pocketbase';
import type {
  Transaction,
  ExpandedTransaction,
  CreateTransactionDto,
  TransactionStatus,
  UserBalance,
  BalanceHistoryEntry,
  User,
} from '@/types/transaction';

// ============================================
// TRANSACTIONS CRUD
// ============================================

/**
 * Create a favor request
 */
async function create(householdId: string, data: CreateTransactionDto): Promise<Transaction> {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('User not authenticated');

  return await pb.collection('transactions').create<Transaction>({
    household: householdId,
    requester: userId,
    assignee: data.assignee,
    title: data.title,
    description: data.description,
    credits: data.credits,
    status: 'PENDING',
  });
}

/**
 * Get all transactions for household
 */
async function getAll(
  householdId: string,
  status?: TransactionStatus
): Promise<ExpandedTransaction[]> {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('User not authenticated');

  const filter = status
    ? `household = "${householdId}" && status = "${status}"`
    : `household = "${householdId}"`;

  const result = await pb.collection('transactions').getList<ExpandedTransaction>(1, 100, {
    filter,
    sort: '-created',
    expand: 'requester,assignee',
  });

  // Add computed permissions to each transaction
  return result.items.map((transaction) => ({
    ...transaction,
    canAccept:
      transaction.status === 'PENDING' &&
      transaction.requester !== userId &&
      !transaction.assignee,
    canComplete: transaction.status === 'ACCEPTED' && transaction.assignee === userId,
    canCancel: transaction.requester === userId && transaction.status === 'PENDING',
  }));
}

// ============================================
// TRANSACTION STATE CHANGES
// ============================================

/**
 * Accept an open favor request
 */
async function accept(householdId: string, transactionId: string): Promise<Transaction> {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('User not authenticated');

  // Get the transaction to verify it's in PENDING status
  const transaction = await pb.collection('transactions').getOne<Transaction>(transactionId);

  if (transaction.status !== 'PENDING') {
    throw new Error('Transaction is not in PENDING status');
  }

  if (transaction.requester === userId) {
    throw new Error('Cannot accept your own favor request');
  }

  if (transaction.assignee && transaction.assignee !== userId) {
    throw new Error('Transaction already assigned to someone else');
  }

  return await pb.collection('transactions').update<Transaction>(transactionId, {
    status: 'ACCEPTED',
    assignee: userId,
    acceptedAt: new Date().toISOString(),
  });
}

/**
 * Complete a task
 */
async function complete(householdId: string, transactionId: string): Promise<Transaction> {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('User not authenticated');

  // Get the transaction to verify it's in ACCEPTED status
  const transaction = await pb.collection('transactions').getOne<Transaction>(transactionId);

  if (transaction.status !== 'ACCEPTED') {
    throw new Error('Transaction is not in ACCEPTED status');
  }

  if (transaction.assignee !== userId) {
    throw new Error('Only the assignee can complete this transaction');
  }

  return await pb.collection('transactions').update<Transaction>(transactionId, {
    status: 'COMPLETED',
    completedAt: new Date().toISOString(),
  });
}

/**
 * Decline a task
 */
async function decline(householdId: string, transactionId: string): Promise<void> {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('User not authenticated');

  // Get the transaction to verify it's in ACCEPTED status
  const transaction = await pb.collection('transactions').getOne<Transaction>(transactionId);

  if (transaction.status !== 'ACCEPTED') {
    throw new Error('Transaction is not in ACCEPTED status');
  }

  if (transaction.assignee !== userId) {
    throw new Error('Only the assignee can decline this transaction');
  }

  // Decline returns the transaction to PENDING status and removes assignee
  await pb.collection('transactions').update<Transaction>(transactionId, {
    status: 'PENDING',
    assignee: null,
    acceptedAt: null,
  });
}

/**
 * Cancel a task
 */
async function cancel(householdId: string, transactionId: string): Promise<void> {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('User not authenticated');

  // Get the transaction to verify it's in PENDING status
  const transaction = await pb.collection('transactions').getOne<Transaction>(transactionId);

  if (transaction.status !== 'PENDING') {
    throw new Error('Can only cancel PENDING transactions');
  }

  if (transaction.requester !== userId) {
    throw new Error('Only the requester can cancel this transaction');
  }

  await pb.collection('transactions').update<Transaction>(transactionId, {
    status: 'CANCELLED',
  });
}

// ============================================
// BALANCE & HISTORY
// ============================================

/**
 * Get my balance
 * Calculates balance from all completed transactions
 */
async function getMyBalance(householdId: string): Promise<UserBalance> {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('User not authenticated');

  // Fetch user info
  const user = await pb.collection('users').getOne<User>(userId);

  // Fetch all COMPLETED transactions for this household where user is involved
  const transactions = await pb.collection('transactions').getFullList<ExpandedTransaction>({
    filter: `household = "${householdId}" && status = "COMPLETED" && (requester = "${userId}" || assignee = "${userId}")`,
    expand: 'requester,assignee',
  });

  // Calculate balances
  let totalEarned = 0;
  let totalSpent = 0;
  let favorsDone = 0;
  let favorsReceived = 0;

  for (const transaction of transactions) {
    if (transaction.assignee === userId) {
      // User completed a favor - earned credits
      totalEarned += transaction.credits;
      favorsDone++;
    } else if (transaction.requester === userId) {
      // User requested a favor - spent credits
      totalSpent += transaction.credits;
      favorsReceived++;
    }
  }

  const balance = totalEarned - totalSpent;

  // Get household members count for stats
  const members = await pb.collection('household_members').getFullList({
    filter: `household = "${householdId}"`,
  });

  // Calculate household health score (simple heuristic)
  // 100 if balanced, decreases if too imbalanced
  const avgBalance = members.length > 0 ? Math.abs(balance) / members.length : 0;
  const healthScore = Math.max(0, 100 - avgBalance * 2);

  return {
    userId,
    username: user.username,
    displayName: user.displayName,
    balance,
    totalEarned,
    totalSpent,
    isReceiving: balance < 0,
    creditsEarned: totalEarned,
    creditsSpent: totalSpent,
    favorsDone,
    favorsReceived,
    householdStats: {
      healthScore: Math.round(healthScore),
      activeMembers: members.length,
    },
  };
}

/**
 * Get my balance history
 */
async function getMyHistory(householdId: string): Promise<BalanceHistoryEntry[]> {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('User not authenticated');

  // Fetch all transactions for this household where user is involved
  const transactions = await pb.collection('transactions').getFullList<ExpandedTransaction>({
    filter: `household = "${householdId}" && (requester = "${userId}" || assignee = "${userId}")`,
    sort: '-created',
    expand: 'requester,assignee',
  });

  // Convert to history entries
  return transactions.map((transaction) => {
    const isAssignee = transaction.assignee === userId;
    const isPositive = isAssignee; // Earned credits if assignee, spent if requester

    // Get the other party's name
    let otherParty = 'Unknown';
    if (isAssignee && transaction.expand?.requester) {
      otherParty = transaction.expand.requester.displayName || transaction.expand.requester.username;
    } else if (!isAssignee && transaction.expand?.assignee) {
      otherParty = transaction.expand.assignee.displayName || transaction.expand.assignee.username;
    }

    return {
      transactionId: transaction.id,
      title: transaction.title,
      credits: transaction.credits,
      isPositive,
      otherParty,
      date: transaction.completedAt || transaction.created,
      status: transaction.status,
    };
  });
}

// ============================================
// EXPORTS
// ============================================

export const transactionsApi = {
  create,
  accept,
  complete,
  decline,
  cancel,
  getAll,
  getMyBalance,
  getMyHistory,
};

// Re-export types for convenience
export type {
  Transaction,
  ExpandedTransaction,
  CreateTransactionDto,
  TransactionStatus,
  UserBalance,
  BalanceHistoryEntry,
};
