// Hardcode for now since import.meta.env isn't working reliably
const API_URL = 'http://localhost:3000/api';

export interface Room {
  id: string;
  householdId: string;
  name: string;
  type: string;
  icon: string;
  description?: string;
  xp: number;
  level: number;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoomStats {
  name: string;
  type: string;
  icon: string;
  level: number;
  xp: number;
  xpForNextLevel: number;
  progressToNextLevel: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: string;
}

export interface CreateRoomDto {
  householdId: string;
  name: string;
  type: string;
  icon?: string;
  description?: string;
  order?: number;
}

export interface TaskPreset {
  id: string;
  title: string;
  description?: string;
  icon: string;
  roomType: string;
  category: string;
  frequency: string;
  difficulty: number;
  estimatedMinutes: number;
  xpReward: number;
  goldReward: number;
  isSystemPreset: boolean;
}

export const roomsApi = {
  async create(data: CreateRoomDto): Promise<Room> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create room');
    }

    return response.json();
  },

  async findByHousehold(householdId: string): Promise<Room[]> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/rooms/household/${householdId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch rooms');
    }

    return response.json();
  },

  async findOne(roomId: string): Promise<Room> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/rooms/${roomId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch room');
    }

    return response.json();
  },

  async getStats(roomId: string): Promise<RoomStats> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/gamification/room-stats/${roomId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch room stats');
    }

    return response.json();
  },

  async update(roomId: string, data: Partial<CreateRoomDto>): Promise<Room> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/rooms/${roomId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update room');
    }

    return response.json();
  },

  async delete(roomId: string): Promise<void> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/rooms/${roomId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete room');
    }
  },

  async getPresetsByRoomType(roomType: string): Promise<TaskPreset[]> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/rooms/presets/${roomType}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch task presets');
    }

    return response.json();
  },

  async createTaskFromPreset(roomId: string, presetId: string): Promise<any> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/rooms/${roomId}/tasks/from-preset/${presetId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create task from preset');
    }

    return response.json();
  },

  async getRoomTasks(roomId: string): Promise<any[]> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/rooms/${roomId}/tasks`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch room tasks');
    }

    return response.json();
  },

  async createCustomTask(roomId: string, data: any): Promise<any> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/rooms/${roomId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create custom task');
    }

    return response.json();
  },

  async updateTask(roomId: string, taskId: string, data: any): Promise<any> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/rooms/${roomId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update task');
    }

    return response.json();
  },

  async deleteTask(roomId: string, taskId: string): Promise<void> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/rooms/${roomId}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete task');
    }
  },

  // ============================================
  // TASK SCHEDULING API (Sprint 5B)
  // ============================================

  async scheduleTask(roomId: string, taskId: string, scheduleData: any): Promise<any> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/rooms/${roomId}/tasks/${taskId}/schedule`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(scheduleData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to schedule task');
    }

    return response.json();
  },

  async generateInstances(roomId: string, taskId: string, until: string): Promise<any[]> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/rooms/${roomId}/tasks/${taskId}/schedule/instances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ until }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate instances');
    }

    return response.json();
  },

  async cancelSchedule(roomId: string, taskId: string): Promise<any> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/rooms/${roomId}/tasks/${taskId}/schedule`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel schedule');
    }

    return response.json();
  },

  async getScheduledTasks(roomId: string, startDate: string, endDate: string): Promise<any[]> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(
      `${API_URL}/rooms/${roomId}/tasks/scheduled?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch scheduled tasks');
    }

    return response.json();
  },

  async updateTaskStatus(roomId: string, taskId: string, status: string): Promise<any> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/rooms/${roomId}/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update task status');
    }

    return response.json();
  },
};
