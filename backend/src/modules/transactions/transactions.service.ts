import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { TransactionStatus } from '@prisma/client';
import {
  CreateTransactionDto,
  TransactionResponse,
  BalanceHistoryEntry,
  UserBalance,
} from './dto/transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a favor request
   */
  async create(
    userId: string,
    householdId: string,
    dto: CreateTransactionDto,
  ): Promise<TransactionResponse> {
    // Verify user is in household
    const member = await this.prisma.householdMember.findFirst({
      where: { userId, householdId },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this household');
    }

    // If assigneeId specified, verify they're in household
    if (dto.assigneeId) {
      const assignee = await this.prisma.householdMember.findFirst({
        where: { userId: dto.assigneeId, householdId },
      });

      if (!assignee) {
        throw new BadRequestException('Assignee is not a member of this household');
      }

      if (dto.assigneeId === userId) {
        throw new BadRequestException('You cannot assign a task to yourself');
      }
    }

    const transaction = await this.prisma.favorTransaction.create({
      data: {
        householdId,
        requesterId: userId,
        assigneeId: dto.assigneeId,
        title: dto.title,
        description: dto.description,
        credits: dto.credits,
        status: dto.assigneeId ? TransactionStatus.PENDING : TransactionStatus.PENDING,
      },
      include: {
        requester: true,
        assignee: true,
      },
    });

    return this.formatTransactionResponse(transaction, userId);
  }

  /**
   * Accept an open favor request
   */
  async accept(userId: string, transactionId: string): Promise<TransactionResponse> {
    const transaction = await this.prisma.favorTransaction.findUnique({
      where: { id: transactionId },
      include: { requester: true, assignee: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('This task is no longer available');
    }

    if (transaction.assigneeId && transaction.assigneeId !== userId) {
      throw new ForbiddenException('This task is assigned to someone else');
    }

    if (transaction.requesterId === userId) {
      throw new BadRequestException('You cannot accept your own request');
    }

    // Verify user is in household
    const member = await this.prisma.householdMember.findFirst({
      where: { userId, householdId: transaction.householdId },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this household');
    }

    const updated = await this.prisma.favorTransaction.update({
      where: { id: transactionId },
      data: {
        assigneeId: userId,
        status: TransactionStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
      include: {
        requester: true,
        assignee: true,
      },
    });

    return this.formatTransactionResponse(updated, userId);
  }

  /**
   * Complete a task (transfer credits)
   */
  async complete(userId: string, transactionId: string): Promise<TransactionResponse> {
    const transaction = await this.prisma.favorTransaction.findUnique({
      where: { id: transactionId },
      include: { requester: true, assignee: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === TransactionStatus.COMPLETED) {
      throw new BadRequestException('This task is already completed');
    }

    if (transaction.status === TransactionStatus.DECLINED || transaction.status === TransactionStatus.CANCELLED) {
      throw new BadRequestException('This task has been cancelled');
    }

    // Only the assignee can complete the task
    if (transaction.assigneeId !== userId) {
      throw new ForbiddenException('Only the assignee can complete this task');
    }

    // LETS Credit Transfer:
    // Requester's contribution goes DOWN (they owe)
    // Assignee's contribution goes UP (they gave)
    const [updated] = await this.prisma.$transaction([
      this.prisma.favorTransaction.update({
        where: { id: transactionId },
        data: {
          status: TransactionStatus.COMPLETED,
          completedAt: new Date(),
        },
        include: {
          requester: true,
          assignee: true,
        },
      }),
      // Update requester's contribution (decrease)
      this.prisma.householdMember.updateMany({
        where: {
          userId: transaction.requesterId,
          householdId: transaction.householdId,
        },
        data: {
          contribution: { decrement: transaction.credits },
        },
      }),
      // Update assignee's contribution (increase)
      this.prisma.householdMember.updateMany({
        where: {
          userId: transaction.assigneeId!,
          householdId: transaction.householdId,
        },
        data: {
          contribution: { increment: transaction.credits },
        },
      }),
    ]);

    return this.formatTransactionResponse(updated, userId);
  }

  /**
   * Decline a task (assignee declines)
   */
  async decline(userId: string, transactionId: string): Promise<void> {
    const transaction = await this.prisma.favorTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.assigneeId !== userId) {
      throw new ForbiddenException('Only the assignee can decline');
    }

    if (transaction.status !== TransactionStatus.PENDING && transaction.status !== TransactionStatus.ACCEPTED) {
      throw new BadRequestException('Cannot decline this task');
    }

    await this.prisma.favorTransaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.DECLINED,
        assigneeId: null,
        acceptedAt: null,
      },
    });
  }

  /**
   * Cancel a task (requester cancels)
   */
  async cancel(userId: string, transactionId: string): Promise<void> {
    const transaction = await this.prisma.favorTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.requesterId !== userId) {
      throw new ForbiddenException('Only the requester can cancel');
    }

    if (transaction.status === TransactionStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed task');
    }

    await this.prisma.favorTransaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.CANCELLED },
    });
  }

  /**
   * Get all transactions for a household
   */
  async getHouseholdTransactions(
    userId: string,
    householdId: string,
    status?: TransactionStatus,
  ): Promise<TransactionResponse[]> {
    const member = await this.prisma.householdMember.findFirst({
      where: { userId, householdId },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this household');
    }

    const transactions = await this.prisma.favorTransaction.findMany({
      where: {
        householdId,
        ...(status && { status }),
      },
      include: {
        requester: true,
        assignee: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((t) => this.formatTransactionResponse(t, userId));
  }

  /**
   * Get user's balance in a household
   */
  async getUserBalance(userId: string, householdId: string): Promise<UserBalance> {
    const member = await this.prisma.householdMember.findFirst({
      where: { userId, householdId },
      include: { user: true },
    });

    if (!member) {
      throw new NotFoundException('Not a member of this household');
    }

    // Get all completed transactions where user was involved
    const asRequester = await this.prisma.favorTransaction.findMany({
      where: {
        householdId,
        requesterId: userId,
        status: TransactionStatus.COMPLETED,
      },
    });

    const asAssignee = await this.prisma.favorTransaction.findMany({
      where: {
        householdId,
        assigneeId: userId,
        status: TransactionStatus.COMPLETED,
      },
    });

    const totalSpent = asRequester.reduce((sum, t) => sum + t.credits, 0);
    const totalEarned = asAssignee.reduce((sum, t) => sum + t.credits, 0);
    const balance = member.contribution; // This is the actual balance from LETS transactions

    return {
      userId,
      username: member.user.username,
      displayName: member.user.displayName,
      balance,
      totalEarned,
      totalSpent,
      isInDebt: balance < 0,
    };
  }

  /**
   * Get user's balance history
   */
  async getBalanceHistory(
    userId: string,
    householdId: string,
  ): Promise<BalanceHistoryEntry[]> {
    const member = await this.prisma.householdMember.findFirst({
      where: { userId, householdId },
    });

    if (!member) {
      throw new NotFoundException('Not a member of this household');
    }

    const transactions = await this.prisma.favorTransaction.findMany({
      where: {
        householdId,
        status: TransactionStatus.COMPLETED,
        OR: [{ requesterId: userId }, { assigneeId: userId }],
      },
      include: {
        requester: true,
        assignee: true,
      },
      orderBy: { completedAt: 'desc' },
    });

    return transactions.map((t) => {
      const isAssignee = t.assigneeId === userId;
      const otherParty = isAssignee
        ? t.requester.displayName || t.requester.username
        : t.assignee?.displayName || t.assignee?.username || 'Unknown';

      return {
        transactionId: t.id,
        title: t.title,
        credits: t.credits,
        isPositive: isAssignee, // true if you earned, false if you spent
        otherParty,
        date: t.completedAt!,
        status: t.status,
      };
    });
  }

  /**
   * Format transaction response
   */
  private formatTransactionResponse(
    transaction: any,
    currentUserId: string,
  ): TransactionResponse {
    const isRequester = transaction.requesterId === currentUserId;
    const isAssignee = transaction.assigneeId === currentUserId;

    return {
      id: transaction.id,
      householdId: transaction.householdId,
      requesterId: transaction.requesterId,
      requesterName:
        transaction.requester.displayName || transaction.requester.username,
      requesterAvatar: transaction.requester.avatar,
      assigneeId: transaction.assigneeId,
      assigneeName: transaction.assignee
        ? transaction.assignee.displayName || transaction.assignee.username
        : undefined,
      assigneeAvatar: transaction.assignee?.avatar,
      title: transaction.title,
      description: transaction.description,
      credits: transaction.credits,
      status: transaction.status,
      createdAt: transaction.createdAt,
      acceptedAt: transaction.acceptedAt,
      completedAt: transaction.completedAt,
      canAccept:
        !isRequester &&
        !isAssignee &&
        transaction.status === TransactionStatus.PENDING &&
        !transaction.assigneeId,
      canComplete:
        isAssignee &&
        (transaction.status === TransactionStatus.ACCEPTED ||
          transaction.status === TransactionStatus.PENDING),
      canCancel:
        isRequester &&
        transaction.status !== TransactionStatus.COMPLETED &&
        transaction.status !== TransactionStatus.CANCELLED,
    };
  }
}
