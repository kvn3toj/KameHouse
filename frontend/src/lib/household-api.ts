import { pb } from './pocketbase';
import type {
  Household,
  HouseholdMember,
  CreateHouseholdDto,
  UpdateHouseholdDto,
  JoinHouseholdDto,
  LeaderboardEntry,
} from '@/types/household';

/**
 * Household API - PocketBase Integration (Rebuilt from scratch)
 * Clean implementation matching current PocketBase schema
 * Schema: households (name, description, inviteCode, maxMembers, isActive)
 * Ownership tracked via household_members.role === 'OWNER'
 */
export const householdApi = {
  /**
   * Get all households for the current user
   * Returns households where user is a member (any role)
   */
  async getAll(): Promise<Household[]> {
    const userId = pb.authStore.model?.id;
    console.log('🔍 [householdApi.getAll] Starting, userId:', userId);

    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      // Get ALL household memberships and filter in JavaScript
      // Note: Using getFullList() instead of filtered query due to PocketBase filter syntax issues
      // Note: Removed sort parameter as it causes 400 errors in browser (works in Node.js)
      console.log('🔍 [householdApi.getAll] Fetching all memberships...');
      const allMemberships = await pb.collection('household_members').getFullList();
      console.log('📊 [householdApi.getAll] Total memberships:', allMemberships.length);

      // Filter for current user's memberships
      const userMemberships = allMemberships.filter(m => m.user === userId);
      console.log('📊 [householdApi.getAll] User memberships:', userMemberships.length, userMemberships);

      // Fetch households for each membership
      console.log('🔍 [householdApi.getAll] Fetching households for', userMemberships.length, 'memberships...');
      const householdPromises = userMemberships.map(m =>
        pb.collection('households').getOne(m.household)
      );

      const households = await Promise.all(householdPromises);
      console.log('✅ [householdApi.getAll] Fetched households:', households.length, households);

      return households as Household[];
    } catch (error) {
      console.error('❌ [householdApi.getAll] Failed to fetch households:', error);
      throw new Error('Failed to load households');
    }
  },

  /**
   * Get household by ID
   * Only returns if user is a member
   */
  async getById(id: string): Promise<Household> {
    const userId = pb.authStore.model?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      // Check if user is a member
      const memberships = await pb.collection('household_members').getList(1, 1, {
        filter: `household = "${id}" && user = "${userId}"`,
      });

      if (memberships.items.length === 0) {
        throw new Error('You are not a member of this household');
      }

      // Fetch the household
      const household = await pb.collection('households').getOne<Household>(id);
      return household;
    } catch (error) {
      console.error('Failed to fetch household:', error);
      throw error;
    }
  },

  /**
   * Get user's primary household (first one they're owner of, or first one they're member of)
   */
  async getMy(): Promise<Household | null> {
    const userId = pb.authStore.model?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      // Try to find household where user is OWNER
      const ownedMemberships = await pb.collection('household_members').getList(1, 1, {
        filter: `user = "${userId}" && role = "OWNER"`,
        expand: 'household',
        sort: '-created',
      });

      if (ownedMemberships.items.length > 0) {
        return ownedMemberships.items[0].expand?.household || null;
      }

      // Fallback: return first household they're a member of
      const anyMemberships = await pb.collection('household_members').getList(1, 1, {
        filter: `user = "${userId}"`,
        expand: 'household',
        sort: '-created',
      });

      return anyMemberships.items[0]?.expand?.household || null;
    } catch (error) {
      console.error('Failed to fetch primary household:', error);
      return null;
    }
  },

  /**
   * Create a new household
   * User becomes the OWNER automatically
   */
  async create(data: CreateHouseholdDto): Promise<Household> {
    const userId = pb.authStore.model?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Validate input
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Household name is required');
    }

    try {
      // Generate unique 8-character invite code
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      // Create the household (matching current schema)
      const household = await pb.collection('households').create<Household>({
        name: data.name.trim(),
        description: data.description?.trim() || '',
        inviteCode,
        maxMembers: data.maxMembers || 10,
        isActive: true,
      });

      // Create household member entry for the owner
      await pb.collection('household_members').create({
        household: household.id,
        user: userId,
        role: 'OWNER',
        contribution: 1,
      });

      console.log('✅ Household created successfully:', household.id);
      return household;
    } catch (error: any) {
      console.error('❌ Failed to create household:', error);

      // Provide user-friendly error messages
      if (error?.message?.includes('Failed to create')) {
        throw new Error('Failed to create household. Please try again.');
      }
      throw error;
    }
  },

  /**
   * Update household
   * Only owner can update
   */
  async update(id: string, data: UpdateHouseholdDto): Promise<Household> {
    const userId = pb.authStore.model?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      // Check if user is owner
      const memberships = await pb.collection('household_members').getList(1, 1, {
        filter: `household = "${id}" && user = "${userId}" && role = "OWNER"`,
      });

      if (memberships.items.length === 0) {
        throw new Error('Only the household owner can update settings');
      }

      // Update household
      const household = await pb.collection('households').update<Household>(id, data);
      return household;
    } catch (error) {
      console.error('Failed to update household:', error);
      throw error;
    }
  },

  /**
   * Delete household
   * Only owner can delete, and it cascades to members
   */
  async delete(id: string): Promise<void> {
    const userId = pb.authStore.model?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      // Check if user is owner
      const memberships = await pb.collection('household_members').getList(1, 1, {
        filter: `household = "${id}" && user = "${userId}" && role = "OWNER"`,
      });

      if (memberships.items.length === 0) {
        throw new Error('Only the household owner can delete the household');
      }

      // Delete household (cascade will delete members)
      await pb.collection('households').delete(id);
      console.log('✅ Household deleted successfully:', id);
    } catch (error) {
      console.error('Failed to delete household:', error);
      throw error;
    }
  },

  /**
   * Join a household using invite code
   */
  async join(data: JoinHouseholdDto): Promise<Household> {
    const userId = pb.authStore.model?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    if (!data.inviteCode || data.inviteCode.trim().length === 0) {
      throw new Error('Invite code is required');
    }

    try {
      // Find household by invite code
      const households = await pb.collection('households').getList<Household>(1, 1, {
        filter: `inviteCode = "${data.inviteCode.trim().toUpperCase()}"`,
      });

      if (households.items.length === 0) {
        throw new Error('Invalid invite code');
      }

      const household = households.items[0];

      // Check if already a member
      const existingMembers = await pb.collection('household_members').getList(1, 1, {
        filter: `household = "${household.id}" && user = "${userId}"`,
      });

      if (existingMembers.items.length > 0) {
        throw new Error('You are already a member of this household');
      }

      // Check member limit (if maxMembers is set)
      if (household.maxMembers) {
        const currentMembers = await pb.collection('household_members').getList(1, 1, {
          filter: `household = "${household.id}"`,
        });

        if (currentMembers.totalItems >= household.maxMembers) {
          throw new Error('This household has reached its member limit');
        }
      }

      // Add user as member
      await pb.collection('household_members').create({
        household: household.id,
        user: userId,
        role: 'MEMBER',
        contribution: 0,
      });

      console.log('✅ Joined household successfully:', household.id);
      return household;
    } catch (error) {
      console.error('Failed to join household:', error);
      throw error;
    }
  },

  /**
   * Leave household
   * Owner cannot leave (must delete or transfer ownership first)
   */
  async leave(householdId: string): Promise<void> {
    const userId = pb.authStore.model?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      // Find user's membership
      const members = await pb.collection('household_members').getList(1, 1, {
        filter: `household = "${householdId}" && user = "${userId}"`,
      });

      if (members.items.length === 0) {
        throw new Error('You are not a member of this household');
      }

      const member = members.items[0];

      // Prevent owner from leaving
      if (member.role === 'OWNER') {
        throw new Error('Owner cannot leave the household. Please delete it or transfer ownership first.');
      }

      // Remove membership
      await pb.collection('household_members').delete(member.id);
      console.log('✅ Left household successfully:', householdId);
    } catch (error) {
      console.error('Failed to leave household:', error);
      throw error;
    }
  },

  /**
   * Get household members
   */
  async getMembers(householdId: string): Promise<HouseholdMember[]> {
    try {
      const result = await pb.collection('household_members').getList<HouseholdMember>(1, 50, {
        filter: `household = "${householdId}"`,
        expand: 'user',
        sort: 'role,-contribution',
      });

      return result.items;
    } catch (error) {
      console.error('Failed to fetch household members:', error);
      throw new Error('Failed to load household members');
    }
  },

  /**
   * Remove member from household
   * Only owner can remove members
   */
  async removeMember(householdId: string, memberId: string): Promise<void> {
    const userId = pb.authStore.model?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      // Check if current user is owner
      const ownerCheck = await pb.collection('household_members').getList(1, 1, {
        filter: `household = "${householdId}" && user = "${userId}" && role = "OWNER"`,
      });

      if (ownerCheck.items.length === 0) {
        throw new Error('Only the household owner can remove members');
      }

      // Check if trying to remove self
      const memberToRemove = await pb.collection('household_members').getOne(memberId);
      if (memberToRemove.user === userId) {
        throw new Error('Cannot remove yourself. Use leave instead.');
      }

      // Remove the member
      await pb.collection('household_members').delete(memberId);
      console.log('✅ Member removed successfully:', memberId);
    } catch (error) {
      console.error('Failed to remove member:', error);
      throw error;
    }
  },

  /**
   * Get household leaderboard
   * Returns members sorted by contribution
   */
  async getLeaderboard(householdId: string): Promise<LeaderboardEntry[]> {
    try {
      const members = await pb.collection('household_members').getList<HouseholdMember>(1, 50, {
        filter: `household = "${householdId}"`,
        sort: '-contribution',
        expand: 'user',
      });

      // Transform to leaderboard entries
      return members.items.map((member, index) => ({
        userId: member.user,
        username: member.expand?.user?.username || '',
        displayName: member.expand?.user?.displayName || 'Unknown',
        avatar: member.expand?.user?.avatar || '',
        level: member.expand?.user?.level || 1,
        xp: member.expand?.user?.xp || 0,
        gold: member.expand?.user?.gold || 0,
        contribution: member.contribution || 0,
        habitsCompleted: 0, // TODO: Calculate from habit_completions
        currentStreak: 0, // TODO: Calculate from user streak
        rank: index + 1,
      }));
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      throw new Error('Failed to load leaderboard');
    }
  },
};
