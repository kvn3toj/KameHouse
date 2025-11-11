import { IsString, IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class CreateTransactionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  credits: number;

  @IsOptional()
  @IsString()
  assigneeId?: string; // If specified, direct request to specific person
}

export interface TransactionResponse {
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
  isPositive: boolean; // true if you earned credits, false if you spent them
  otherParty: string;
  date: Date;
  status: TransactionStatus;
}

export interface UserBalance {
  userId: string;
  username: string;
  displayName?: string;
  balance: number; // Can be negative!
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
