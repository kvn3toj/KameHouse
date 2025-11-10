import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { QuestsService } from './quests.service';
import { QuestsController } from './quests.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [QuestsController],
  providers: [QuestsService, PrismaService],
  exports: [QuestsService],
})
export class QuestsModule {}
