/**
 * Chores API - PocketBase Implementation
 * PHOENIX-12 Phase 2D: Migrated from legacy localhost:3000 to PocketBase
 *
 * Collections used:
 * - chore_templates: Household chore definitions
 * - chore_assignments: Weekly chore assignments to users
 */

import { pb } from './pocketbase';
import type {
  ChoreTemplate,
  ChoreAssignment,
  CreateChoreTemplateDto,
  UpdateChoreTemplateDto,
  CompleteChoreDto,
  SwapChoreDto,
  AssignChoresResponse,
  CompleteChoreResponse,
} from '@/types/chore';

// ============================================
// CHORE TEMPLATES
// ============================================

/**
 * Create a new chore template
 */
export async function createChoreTemplate(dto: CreateChoreTemplateDto): Promise<ChoreTemplate> {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('User not authenticated');

  return await pb.collection('chore_templates').create<ChoreTemplate>({
    household: dto.household,
    title: dto.title,
    description: dto.description || '',
    icon: dto.icon || '🧹',
    difficulty: dto.difficulty ?? 3,
    estimatedTime: dto.estimatedTime,
    xpReward: dto.xpReward ?? 50,
    goldReward: dto.goldReward ?? 10,
    letsCredit: dto.letsCredit ?? 1,
    frequency: dto.frequency || 'WEEKLY',
    photoRequired: dto.photoRequired ?? false,
    isActive: true,
  });
}

/**
 * Get all chore templates for a household
 */
export async function getChoreTemplates(householdId: string): Promise<ChoreTemplate[]> {
  const result = await pb.collection('chore_templates').getList<ChoreTemplate>(1, 100, {
    filter: `household = "${householdId}" && isActive = true`,
    sort: 'title',
  });
  return result.items;
}

/**
 * Update a chore template
 */
export async function updateChoreTemplate(
  templateId: string,
  dto: UpdateChoreTemplateDto
): Promise<ChoreTemplate> {
  return await pb.collection('chore_templates').update<ChoreTemplate>(templateId, dto);
}

/**
 * Delete a chore template (soft delete)
 */
export async function deleteChoreTemplate(templateId: string): Promise<void> {
  await pb.collection('chore_templates').update(templateId, { isActive: false });
}

// ============================================
// CHORE ASSIGNMENTS
// ============================================

/**
 * Auto-assign chores for the current week
 * This is a simplified version - in production, this would be a backend service
 */
export async function assignChoresForWeek(householdId: string): Promise<AssignChoresResponse> {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('User not authenticated');

  // Get all active chore templates for the household
  const templates = await getChoreTemplates(householdId);

  // Get all household members
  const members = await pb.collection('household_members').getFullList({
    filter: `household = "${householdId}"`,
    expand: 'user',
  });

  if (members.length === 0) {
    throw new Error('No household members found');
  }

  // Calculate the start of the current week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);
  const weekStarting = weekStart.toISOString();

  // Check if assignments already exist for this week
  const existingAssignments = await pb.collection('chore_assignments').getList<ChoreAssignment>(1, 1, {
    filter: `household = "${householdId}" && weekStarting = "${weekStarting}"`,
  });

  if (existingAssignments.totalItems > 0) {
    const allAssignments = await pb.collection('chore_assignments').getFullList<ChoreAssignment>({
      filter: `household = "${householdId}" && weekStarting = "${weekStarting}"`,
      expand: 'chore,assignedTo',
    });
    return {
      message: 'Assignments already exist for this week',
      assignments: allAssignments,
    };
  }

  // Create assignments using round-robin distribution
  const assignments: ChoreAssignment[] = [];
  let memberIndex = 0;

  for (const template of templates) {
    const assignment = await pb.collection('chore_assignments').create<ChoreAssignment>({
      chore: template.id,
      household: householdId,
      assignedTo: members[memberIndex].user,
      weekStarting,
      isCompleted: false,
      swapRequested: false,
      rewardsAwarded: false,
    });
    assignments.push(assignment);

    // Move to next member (round-robin)
    memberIndex = (memberIndex + 1) % members.length;
  }

  return {
    message: `Successfully assigned ${assignments.length} chores for this week`,
    assignments,
  };
}

/**
 * Get current user's chores for this week
 */
export async function getMyChores(): Promise<ChoreAssignment[]> {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('User not authenticated');

  // Calculate the start of the current week
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);
  const weekStarting = weekStart.toISOString();

  const result = await pb.collection('chore_assignments').getFullList<ChoreAssignment>({
    filter: `assignedTo = "${userId}" && weekStarting = "${weekStarting}"`,
    sort: 'isCompleted,created',
    expand: 'chore',
  });

  return result;
}

/**
 * Get all assignments for a household for the current week
 */
export async function getHouseholdChores(householdId: string): Promise<ChoreAssignment[]> {
  // Calculate the start of the current week
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);
  const weekStarting = weekStart.toISOString();

  const result = await pb.collection('chore_assignments').getFullList<ChoreAssignment>({
    filter: `household = "${householdId}" && weekStarting = "${weekStarting}"`,
    sort: 'isCompleted,created',
    expand: 'chore,assignedTo,completedBy',
  });

  return result;
}

/**
 * Mark a chore as complete
 */
export async function completeChore(
  assignmentId: string,
  dto: CompleteChoreDto
): Promise<CompleteChoreResponse> {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('User not authenticated');

  // Get the assignment with expanded chore template
  const assignment = await pb.collection('chore_assignments').getOne<ChoreAssignment>(assignmentId, {
    expand: 'chore',
  });

  // Update the assignment
  const updatedAssignment = await pb.collection('chore_assignments').update<ChoreAssignment>(assignmentId, {
    isCompleted: true,
    completedAt: new Date().toISOString(),
    completedBy: userId,
    photoUrl: dto.photoUrl,
    notes: dto.notes,
    rewardsAwarded: true,
  });

  // Get the chore template to determine rewards
  const chore = await pb.collection('chore_templates').getOne<ChoreTemplate>(assignment.chore);

  // Award rewards (in a real app, this would update user stats)
  const rewards = {
    xp: chore.xpReward,
    gold: chore.goldReward,
    letsCredit: chore.letsCredit,
  };

  return {
    assignment: updatedAssignment,
    rewards,
  };
}

/**
 * Request to swap chore with another user
 */
export async function swapChore(assignmentId: string, dto: SwapChoreDto): Promise<ChoreAssignment> {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('User not authenticated');

  // Mark the swap request
  const updated = await pb.collection('chore_assignments').update<ChoreAssignment>(assignmentId, {
    swapRequested: true,
    swappedWith: dto.targetUserId,
  });

  // TODO: In a full implementation, this would create a notification for the target user
  // and require their approval before actually swapping the assignments

  return updated;
}

// Re-export types for convenience
export type { ChoreTemplate, ChoreAssignment, CreateChoreTemplateDto, CompleteChoreDto };
