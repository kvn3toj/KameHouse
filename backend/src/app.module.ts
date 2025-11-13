import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HabitsModule } from './modules/habits/habits.module';
import { QuestsModule } from './modules/quests/quests.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { HouseholdModule } from './modules/household/household.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { ChoresModule } from './modules/chores/chores.module';
import { BulletinModule } from './modules/bulletin/bulletin.module';
import { RoomsModule } from './rooms/rooms.module';
import { GamificationModule } from './gamification/gamification.module';
import { NotificationModule } from './notifications/notification.module';
import { CategoryModule } from './categories/category.module';
import { TagModule } from './tags/tag.module';
import { TaskHistoryModule } from './task-history/task-history.module';
import { RoomTemplateModule } from './room-templates/room-template.module';
import { BulkOperationsModule } from './bulk-operations/bulk-operations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    HabitsModule,
    QuestsModule,
    AchievementsModule,
    HouseholdModule,
    TransactionsModule,
    ChoresModule,
    BulletinModule,
    RoomsModule,
    GamificationModule,
    NotificationModule,
    CategoryModule,
    TagModule,
    TaskHistoryModule,
    RoomTemplateModule,
    BulkOperationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
