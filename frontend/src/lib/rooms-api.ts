/**
 * Rooms API - PocketBase Implementation
 * PHOENIX-12 Phase 2A: Migrated from legacy localhost:3000 to PocketBase
 *
 * Collections used:
 * - rooms: Room CRUD and XP management
 * - task_presets: Task templates for quick task creation
 * - room_tasks: Task instances, scheduling, and completion tracking
 */

import { pb } from './pocketbase';
import type {
  Room,
  RoomStats,
  CreateRoomDto,
  UpdateRoomDto,
  TaskPreset,
  RoomTask,
  CreateTaskDto,
  UpdateTaskDto,
  ScheduleTaskDto,
  TaskStatus,
} from '@/types/room';

// ============================================
// ROOM CRUD
// ============================================

export const roomsApi = {
  /**
   * Create a new room in a household
   */
  async create(data: CreateRoomDto): Promise<Room> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('User not authenticated');

    return await pb.collection('rooms').create<Room>({
      household: data.household,
      name: data.name,
      type: data.type,
      icon: data.icon || '',
      description: data.description || '',
      xp: 0,
      level: 1,
      order: data.order ?? 0,
      isActive: true,
    });
  },

  /**
   * Get all rooms for a household
   */
  async findByHousehold(householdId: string): Promise<Room[]> {
    const result = await pb.collection('rooms').getList<Room>(1, 100, {
      filter: `household = "${householdId}" && isActive = true`,
      sort: 'order,created',
    });
    return result.items;
  },

  /**
   * Get a single room by ID
   */
  async findOne(roomId: string): Promise<Room> {
    return await pb.collection('rooms').getOne<Room>(roomId);
  },

  /**
   * Get room statistics (XP, level, tasks, completion)
   */
  async getStats(roomId: string): Promise<RoomStats> {
    const room = await pb.collection('rooms').getOne<Room>(roomId);

    // Fetch room tasks to calculate stats
    const tasks = await pb.collection('room_tasks').getList<RoomTask>(1, 500, {
      filter: `room = "${roomId}"`,
    });

    const totalTasks = tasks.items.length;
    const completedTasks = tasks.items.filter(t => t.status === 'COMPLETED').length;
    const completionRate = totalTasks > 0
      ? `${Math.round((completedTasks / totalTasks) * 100)}%`
      : '0%';

    // XP system: 100 XP per level, exponential growth
    const xpForNextLevel = room.level * 100;
    const progressToNextLevel = (room.xp / xpForNextLevel) * 100;

    return {
      name: room.name,
      type: room.type,
      icon: room.icon,
      level: room.level,
      xp: room.xp,
      xpForNextLevel,
      progressToNextLevel: Math.min(progressToNextLevel, 100),
      totalTasks,
      completedTasks,
      completionRate,
    };
  },

  /**
   * Update room properties
   */
  async update(roomId: string, data: UpdateRoomDto): Promise<Room> {
    return await pb.collection('rooms').update<Room>(roomId, data);
  },

  /**
   * Soft delete a room (sets isActive to false)
   */
  async delete(roomId: string): Promise<void> {
    await pb.collection('rooms').update(roomId, { isActive: false });
  },

  // ============================================
  // TASK PRESETS
  // ============================================

  /**
   * Get all task presets for a specific room type
   */
  async getPresetsByRoomType(roomType: string): Promise<TaskPreset[]> {
    const result = await pb.collection('task_presets').getList<TaskPreset>(1, 100, {
      filter: `roomType = "${roomType}" || roomType = "ALL"`,
      sort: 'category,title',
    });
    return result.items;
  },

  /**
   * Create a task from a preset template
   */
  async createTaskFromPreset(roomId: string, presetId: string): Promise<RoomTask> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('User not authenticated');

    // Fetch the preset
    const preset = await pb.collection('task_presets').getOne<TaskPreset>(presetId);

    // Fetch room to get household
    const room = await pb.collection('rooms').getOne<Room>(roomId);

    // Create task from preset
    return await pb.collection('room_tasks').create<RoomTask>({
      room: roomId,
      household: room.household,
      createdBy: userId,
      title: preset.title,
      description: preset.description || '',
      difficulty: preset.difficulty,
      estimatedMinutes: preset.estimatedMinutes,
      xpReward: preset.xpReward,
      goldReward: preset.goldReward,
      status: 'TODO',
      isRecurring: false,
    });
  },

  // ============================================
  // ROOM TASKS
  // ============================================

  /**
   * Get all tasks for a room
   */
  async getRoomTasks(roomId: string): Promise<RoomTask[]> {
    const result = await pb.collection('room_tasks').getList<RoomTask>(1, 500, {
      filter: `room = "${roomId}"`,
      sort: '-created',
      expand: 'createdBy,completedBy',
    });
    return result.items;
  },

  /**
   * Create a custom task for a room
   */
  async createCustomTask(roomId: string, data: CreateTaskDto): Promise<RoomTask> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('User not authenticated');

    return await pb.collection('room_tasks').create<RoomTask>({
      ...data,
      room: roomId,
      createdBy: userId,
      status: 'TODO',
    });
  },

  /**
   * Update a task
   */
  async updateTask(roomId: string, taskId: string, data: UpdateTaskDto): Promise<RoomTask> {
    return await pb.collection('room_tasks').update<RoomTask>(taskId, data);
  },

  /**
   * Delete a task
   */
  async deleteTask(roomId: string, taskId: string): Promise<void> {
    await pb.collection('room_tasks').delete(taskId);
  },

  /**
   * Update task status (convenience method)
   */
  async updateTaskStatus(roomId: string, taskId: string, status: TaskStatus): Promise<RoomTask> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('User not authenticated');

    const updateData: UpdateTaskDto = { status };

    // If completing task, record completion details
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date().toISOString();
      updateData.completedBy = userId;

      // Award XP to room
      const task = await pb.collection('room_tasks').getOne<RoomTask>(taskId);
      const room = await pb.collection('rooms').getOne<Room>(task.room);

      const newXp = room.xp + task.xpReward;
      const xpForNextLevel = room.level * 100;
      const newLevel = room.level + Math.floor(newXp / xpForNextLevel);

      await pb.collection('rooms').update(room.id, {
        xp: newXp % xpForNextLevel, // Carry over remaining XP
        level: newLevel,
      });
    }

    return await pb.collection('room_tasks').update<RoomTask>(taskId, updateData);
  },

  // ============================================
  // TASK SCHEDULING
  // ============================================

  /**
   * Schedule a task with recurring pattern
   */
  async scheduleTask(roomId: string, taskId: string, scheduleData: ScheduleTaskDto): Promise<RoomTask> {
    return await pb.collection('room_tasks').update<RoomTask>(taskId, {
      isRecurring: scheduleData.isRecurring,
      recurringPattern: scheduleData.recurringPattern,
    });
  },

  /**
   * Generate task instances from recurring pattern
   * Note: This is a simplified version - full implementation would require
   * a backend service or cron job to generate instances automatically
   */
  async generateInstances(roomId: string, taskId: string, until: string): Promise<RoomTask[]> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('User not authenticated');

    const parentTask = await pb.collection('room_tasks').getOne<RoomTask>(taskId);

    if (!parentTask.isRecurring || !parentTask.recurringPattern) {
      throw new Error('Task is not recurring');
    }

    // For now, create a single instance as a placeholder
    // Full implementation would generate multiple instances based on pattern
    const instance = await pb.collection('room_tasks').create<RoomTask>({
      room: roomId,
      household: parentTask.household,
      createdBy: userId,
      title: parentTask.title,
      description: parentTask.description,
      difficulty: parentTask.difficulty,
      estimatedMinutes: parentTask.estimatedMinutes,
      xpReward: parentTask.xpReward,
      goldReward: parentTask.goldReward,
      status: 'TODO',
      isRecurring: false,
      parentTaskId: taskId,
      dueDate: until,
    });

    return [instance];
  },

  /**
   * Cancel a recurring task schedule
   */
  async cancelSchedule(roomId: string, taskId: string): Promise<RoomTask> {
    return await pb.collection('room_tasks').update<RoomTask>(taskId, {
      isRecurring: false,
      recurringPattern: null,
    });
  },

  /**
   * Get scheduled tasks within a date range
   */
  async getScheduledTasks(roomId: string, startDate: string, endDate: string): Promise<RoomTask[]> {
    const result = await pb.collection('room_tasks').getList<RoomTask>(1, 500, {
      filter: `room = "${roomId}" && dueDate >= "${startDate}" && dueDate <= "${endDate}"`,
      sort: 'dueDate',
      expand: 'createdBy,completedBy',
    });
    return result.items;
  },
};

// Re-export types for convenience
export type {
  Room,
  RoomStats,
  CreateRoomDto,
  UpdateRoomDto,
  TaskPreset,
  RoomTask,
  CreateTaskDto,
  UpdateTaskDto,
  TaskStatus,
};
