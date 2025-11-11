export enum TransactionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  COMPLETED = 'COMPLETED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED',
}

export interface Transaction {
  id: string;
  householdId: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar?: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  title: string;
  description?: string;
  credits: number;
  status: TransactionStatus;
  createdAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  canAccept: boolean;
  canComplete: boolean;
  canCancel: boolean;
}

export interface BalanceHistoryEntry {
  transactionId: string;
  title: string;
  credits: number;
  isPositive: boolean;
  otherParty: string;
  date: Date;
  status: TransactionStatus;
}

export interface UserBalance {
  userId: string;
  username: string;
  displayName?: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  isReceiving: boolean; // True when balance < 0 (receiving support from household)
  creditsEarned?: number;
  creditsSpent?: number;
  favorsDone?: number;
  favorsReceived?: number;
  householdStats?: {
    healthScore: number;
    activeMembers: number;
  };
}

export interface CreateTransactionDto {
  title: string;
  description?: string;
  credits: number;
  assigneeId?: string;
}
