import { api } from './api';

export interface ChoreTemplate {
  id: string;
  householdId: string;
  title: string;
  description?: string;
  icon?: string;
  difficulty: number;
  estimatedTime?: number;
  xpReward: number;
  goldReward: number;
  letsCredit: number;
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  photoRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignments?: ChoreAssignment[];
}

export interface ChoreAssignment {
  id: string;
  choreId: string;
  assignedTo: string;
  weekStarting: string;
  isCompleted: boolean;
  completedAt?: string;
  photoUrl?: string;
  notes?: string;
  swapRequested: boolean;
  swappedWith?: string;
  createdAt: string;
  updatedAt: string;
  chore?: ChoreTemplate;
  user?: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
}

export interface CreateChoreTemplateDto {
  householdId: string;
  title: string;
  description?: string;
  icon?: string;
  difficulty?: number;
  estimatedTime?: number;
  xpReward?: number;
  goldReward?: number;
  letsCredit?: number;
  frequency?: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  photoRequired?: boolean;
}

export interface CompleteChoreDto {
  photoUrl?: string;
  notes?: string;
}

export interface SwapChoreDto {
  targetUserId: string;
}

/**
 * Create a new chore template
 */
export async function createChoreTemplate(dto: CreateChoreTemplateDto): Promise<ChoreTemplate> {
  return api.post<ChoreTemplate>('/chores/templates', dto);
}

/**
 * Get all chore templates for a household
 */
export async function getChoreTemplates(householdId: string): Promise<ChoreTemplate[]> {
  return api.get<ChoreTemplate[]>(`/chores/templates/${householdId}`);
}

/**
 * Auto-assign chores for the current week
 */
export async function assignChoresForWeek(householdId: string): Promise<{ message: string; assignments: ChoreAssignment[] }> {
  return api.post<{ message: string; assignments: ChoreAssignment[] }>(`/chores/assign/${householdId}`);
}

/**
 * Get current user's chores for this week
 */
export async function getMyChores(): Promise<ChoreAssignment[]> {
  return api.get<ChoreAssignment[]>('/chores/my-week');
}

/**
 * Mark a chore as complete
 */
export async function completeChore(assignmentId: string, dto: CompleteChoreDto): Promise<{ assignment: ChoreAssignment; rewards: { xp: number; gold: number; letsCredit: number } }> {
  return api.post<{ assignment: ChoreAssignment; rewards: { xp: number; gold: number; letsCredit: number } }>(`/chores/${assignmentId}/complete`, dto);
}

/**
 * Request to swap chore with another user
 */
export async function swapChore(assignmentId: string, dto: SwapChoreDto): Promise<ChoreAssignment> {
  return api.post<ChoreAssignment>(`/chores/${assignmentId}/swap`, dto);
}
