import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TransactionsService } from './transactions.service';
import { TransactionStatus } from '@prisma/client';
import {
  CreateTransactionDto,
  TransactionResponse,
  BalanceHistoryEntry,
  UserBalance,
} from './dto/transaction.dto';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post(':householdId')
  async create(
    @Req() req: any,
    @Param('householdId') householdId: string,
    @Body() dto: CreateTransactionDto,
  ): Promise<TransactionResponse> {
    return this.transactionsService.create(req.user.userId, householdId, dto);
  }

  @Post(':householdId/:transactionId/accept')
  async accept(
    @Req() req: any,
    @Param('transactionId') transactionId: string,
  ): Promise<TransactionResponse> {
    return this.transactionsService.accept(req.user.userId, transactionId);
  }

  @Post(':householdId/:transactionId/complete')
  async complete(
    @Req() req: any,
    @Param('transactionId') transactionId: string,
  ): Promise<TransactionResponse> {
    return this.transactionsService.complete(req.user.userId, transactionId);
  }

  @Post(':householdId/:transactionId/decline')
  async decline(
    @Req() req: any,
    @Param('transactionId') transactionId: string,
  ): Promise<void> {
    return this.transactionsService.decline(req.user.userId, transactionId);
  }

  @Delete(':householdId/:transactionId')
  async cancel(
    @Req() req: any,
    @Param('transactionId') transactionId: string,
  ): Promise<void> {
    return this.transactionsService.cancel(req.user.userId, transactionId);
  }

  @Get(':householdId')
  async getHouseholdTransactions(
    @Req() req: any,
    @Param('householdId') householdId: string,
    @Query('status') status?: TransactionStatus,
  ): Promise<TransactionResponse[]> {
    return this.transactionsService.getHouseholdTransactions(
      req.user.userId,
      householdId,
      status,
    );
  }

  @Get(':householdId/balance/me')
  async getMyBalance(
    @Req() req: any,
    @Param('householdId') householdId: string,
  ): Promise<UserBalance> {
    return this.transactionsService.getUserBalance(req.user.userId, householdId);
  }

  @Get(':householdId/history/me')
  async getMyHistory(
    @Req() req: any,
    @Param('householdId') householdId: string,
  ): Promise<BalanceHistoryEntry[]> {
    return this.transactionsService.getBalanceHistory(req.user.userId, householdId);
  }
}
