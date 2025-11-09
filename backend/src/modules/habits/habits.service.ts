import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { CompleteHabitDto } from './dto/complete-habit.dto';
import { HabitType } from '@prisma/client';

@Injectable()
export class HabitsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createHabitDto: CreateHabitDto) {
    const habit = await this.prisma.habit.create({
      data: {
        ...createHabitDto,
        userId,
        startDate: createHabitDto.startDate ? new Date(createHabitDto.startDate) : undefined,
        endDate: createHabitDto.endDate ? new Date(createHabitDto.endDate) : undefined,
      },
    });

    return habit;
  }

  async findAll(userId: string) {
    return this.prisma.habit.findMany({
      where: { userId },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        completions: {
          orderBy: { completedAt: 'desc' },
          take: 7, // Last 7 completions
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const habit = await this.prisma.habit.findFirst({
      where: { id, userId },
      include: {
        completions: {
          orderBy: { completedAt: 'desc' },
        },
      },
    });

    if (!habit) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }

    return habit;
  }

  async update(id: string, userId: string, updateHabitDto: UpdateHabitDto) {
    await this.findOne(id, userId); // Check if exists and belongs to user

    const habit = await this.prisma.habit.update({
      where: { id },
      data: {
        ...updateHabitDto,
        startDate: updateHabitDto.startDate ? new Date(updateHabitDto.startDate) : undefined,
        endDate: updateHabitDto.endDate ? new Date(updateHabitDto.endDate) : undefined,
      },
    });

    return habit;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Check if exists and belongs to user

    await this.prisma.habit.delete({
      where: { id },
    });

    return { message: 'Habit deleted successfully' };
  }

  async complete(id: string, userId: string, completeHabitDto: CompleteHabitDto) {
    const habit = await this.findOne(id, userId);

    const completionDate = completeHabitDto.date
      ? new Date(completeHabitDto.date)
      : new Date();

    // Set time to midnight for date comparison
    completionDate.setHours(0, 0, 0, 0);

    // Check if already completed today
    const existingCompletion = await this.prisma.habitCompletion.findUnique({
      where: {
        habitId_date: {
          habitId: id,
          date: completionDate,
        },
      },
    });

    if (existingCompletion) {
      throw new ConflictException('Habit already completed for this date');
    }

    // Calculate rewards based on habit type and difficulty
    const xpEarned = habit.xpReward;
    const goldEarned = habit.goldReward;
    const healthChange = habit.type === HabitType.NEGATIVE ? -habit.healthCost : 0;

    // Create completion record
    const completion = await this.prisma.habitCompletion.create({
      data: {
        userId,
        habitId: id,
        date: completionDate,
        notes: completeHabitDto.notes,
        xpEarned,
        goldEarned,
      },
    });

    // Update user stats
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const newXp = user.xp + xpEarned;
    const newLevel = Math.floor(newXp / 100) + 1; // Simple leveling: 100 XP per level
    const newHealth = Math.max(0, Math.min(user.maxHealth, user.health + healthChange));

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel,
        gold: user.gold + goldEarned,
        health: newHealth,
        lastActive: new Date(),
      },
    });

    // Update habit stats
    await this.prisma.habit.update({
      where: { id },
      data: {
        totalCompletions: { increment: 1 },
        currentStreak: { increment: 1 },
        longestStreak: Math.max(habit.longestStreak, habit.currentStreak + 1),
      },
    });

    return {
      completion,
      rewards: {
        xp: xpEarned,
        gold: goldEarned,
        healthChange,
        levelUp: newLevel > user.level,
        newLevel,
      },
    };
  }

  async uncomplete(id: string, userId: string, date?: string) {
    const habit = await this.findOne(id, userId);

    const completionDate = date ? new Date(date) : new Date();
    completionDate.setHours(0, 0, 0, 0);

    const completion = await this.prisma.habitCompletion.findUnique({
      where: {
        habitId_date: {
          habitId: id,
          date: completionDate,
        },
      },
    });

    if (!completion) {
      throw new NotFoundException('Completion not found for this date');
    }

    // Revert user stats
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const newXp = Math.max(0, user.xp - completion.xpEarned);
      const newLevel = Math.floor(newXp / 100) + 1;
      const healthChange = habit.type === HabitType.NEGATIVE ? habit.healthCost : 0;

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          xp: newXp,
          level: newLevel,
          gold: Math.max(0, user.gold - completion.goldEarned),
          health: Math.min(user.maxHealth, user.health + healthChange),
        },
      });
    }

    // Delete completion
    await this.prisma.habitCompletion.delete({
      where: {
        habitId_date: {
          habitId: id,
          date: completionDate,
        },
      },
    });

    // Update habit stats
    await this.prisma.habit.update({
      where: { id },
      data: {
        totalCompletions: Math.max(0, habit.totalCompletions - 1),
        currentStreak: Math.max(0, habit.currentStreak - 1),
      },
    });

    return { message: 'Habit completion removed' };
  }
}
