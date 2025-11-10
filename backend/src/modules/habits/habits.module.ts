import { Module } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { HabitsController } from './habits.controller';
import { PrismaService } from '../../prisma.service';
import { QuestsModule } from '../quests/quests.module';

@Module({
  imports: [QuestsModule],
  controllers: [HabitsController],
  providers: [HabitsService, PrismaService],
  exports: [HabitsService],
})
export class HabitsModule {}
