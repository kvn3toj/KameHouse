import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { TaskSchedulerService } from './task-scheduler.service';
import { PrismaService } from '../prisma.service';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [RoomsController],
  providers: [RoomsService, TaskSchedulerService, PrismaService],
  exports: [RoomsService, TaskSchedulerService],
})
export class RoomsModule {}
