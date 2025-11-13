import { Module } from '@nestjs/common';
import { BulkOperationsController } from './bulk-operations.controller';
import { BulkOperationsService } from './bulk-operations.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [BulkOperationsController],
  providers: [BulkOperationsService, PrismaService],
  exports: [BulkOperationsService],
})
export class BulkOperationsModule {}
