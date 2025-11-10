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
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
