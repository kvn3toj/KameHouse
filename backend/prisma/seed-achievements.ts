import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const achievements = [
  // Level Achievements
  {
    key: 'level_5',
    name: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    category: 'level',
    requirement: 5,
    xpReward: 50,
    goldReward: 25,
    gemsReward: 1,
  },
  {
    key: 'level_10',
    name: 'Dedicated Learner',
    description: 'Reach level 10',
    icon: '🌟',
    category: 'level',
    requirement: 10,
    xpReward: 100,
    goldReward: 50,
    gemsReward: 2,
  },
  {
    key: 'level_25',
    name: 'Master of Habits',
    description: 'Reach level 25',
    icon: '💫',
    category: 'level',
    requirement: 25,
    xpReward: 250,
    goldReward: 125,
    gemsReward: 5,
  },

  // Habit Creation Achievements
  {
    key: 'first_habit',
    name: 'First Step',
    description: 'Create your first habit',
    icon: '🌱',
    category: 'habits',
    requirement: 1,
    xpReward: 10,
    goldReward: 5,
    gemsReward: 0,
  },
  {
    key: 'habit_collector',
    name: 'Habit Collector',
    description: 'Create 5 habits',
    icon: '📚',
    category: 'habits',
    requirement: 5,
    xpReward: 25,
    goldReward: 15,
    gemsReward: 0,
  },
  {
    key: 'habit_master',
    name: 'Habit Architect',
    description: 'Create 10 habits',
    icon: '🏗️',
    category: 'habits',
    requirement: 10,
    xpReward: 50,
    goldReward: 30,
    gemsReward: 1,
  },

  // Completion Achievements
  {
    key: 'first_complete',
    name: 'Getting Started',
    description: 'Complete your first habit',
    icon: '✅',
    category: 'completions',
    requirement: 1,
    xpReward: 10,
    goldReward: 5,
    gemsReward: 0,
  },
  {
    key: 'completions_10',
    name: 'Momentum Builder',
    description: 'Complete 10 habits',
    icon: '🔥',
    category: 'completions',
    requirement: 10,
    xpReward: 30,
    goldReward: 15,
    gemsReward: 0,
  },
  {
    key: 'completions_50',
    name: 'Consistency King',
    description: 'Complete 50 habits',
    icon: '👑',
    category: 'completions',
    requirement: 50,
    xpReward: 100,
    goldReward: 50,
    gemsReward: 2,
  },
  {
    key: 'completions_100',
    name: 'Century Club',
    description: 'Complete 100 habits',
    icon: '💯',
    category: 'completions',
    requirement: 100,
    xpReward: 200,
    goldReward: 100,
    gemsReward: 3,
  },

  // Streak Achievements
  {
    key: 'streak_3',
    name: 'Three Days Strong',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    category: 'streak',
    requirement: 3,
    xpReward: 15,
    goldReward: 10,
    gemsReward: 0,
  },
  {
    key: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚡',
    category: 'streak',
    requirement: 7,
    xpReward: 35,
    goldReward: 20,
    gemsReward: 1,
  },
  {
    key: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '🌙',
    category: 'streak',
    requirement: 30,
    xpReward: 150,
    goldReward: 75,
    gemsReward: 3,
  },
  {
    key: 'streak_100',
    name: 'Unstoppable',
    description: 'Maintain a 100-day streak',
    icon: '🚀',
    category: 'streak',
    requirement: 100,
    xpReward: 500,
    goldReward: 250,
    gemsReward: 10,
  },

  // Wealth Achievements
  {
    key: 'gold_100',
    name: 'First Fortune',
    description: 'Accumulate 100 gold',
    icon: '💰',
    category: 'gold',
    requirement: 100,
    xpReward: 25,
    goldReward: 10,
    gemsReward: 0,
  },
  {
    key: 'gold_500',
    name: 'Wealthy Warrior',
    description: 'Accumulate 500 gold',
    icon: '💎',
    category: 'gold',
    requirement: 500,
    xpReward: 75,
    goldReward: 50,
    gemsReward: 2,
  },
];

async function main() {
  console.log('🎯 Seeding achievements...');

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
  }

  console.log(`✅ Seeded ${achievements.length} achievements!`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding achievements:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
