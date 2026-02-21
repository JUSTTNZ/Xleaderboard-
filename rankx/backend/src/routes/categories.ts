import express, { Request, Response } from 'express';
import { Types } from 'mongoose';
import Category from '../models/Category';
import CategoryMember from '../models/CategoryMember';
import Vote from '../models/Vote';
import User from '../models/User';
import { optionalAuth, authenticate } from '../middleware/auth';
import { AuthenticatedRequest, OptionalAuthRequest, ICategoryMemberPopulatedUser } from '../types';
import { recalculateRankings } from '../lib/rankings';

const router = express.Router();

interface ApplyBody {
  reason?: string;
}

interface LeaderboardEntry {
  rank: number;
  user: {
    _id: unknown;
    handle: string;
    display_name: string;
    avatar_url: string;
    bio: string;
    followers_count: number;
  };
  vote_count: number;
  rank_change: number;
  is_voted: boolean;
  is_self: boolean;
}

// GET /api/categories - Get all active categories
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({ is_active: true }).sort({ name: 1 });

    const categoriesWithMembers = await Promise.all(
      categories.map(async (category) => {
        const topMembers = await CategoryMember.find({
          category: category._id,
          status: 'approved',
        })
          .sort({ vote_count: -1 })
          .limit(3)
          .populate('user', 'handle display_name avatar_url') as unknown as ICategoryMemberPopulatedUser[];

        return {
          ...category.toObject(),
          top_members: topMembers.map((m) => ({
            handle: m.user.handle,
            display_name: m.user.display_name,
            avatar_url: m.user.avatar_url,
          })),
        };
      })
    );

    res.json({ success: true, categories: categoriesWithMembers });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/categories/:slug - Get category with leaderboard
router.get('/:slug', optionalAuth as express.RequestHandler, async (req: Request, res: Response): Promise<void> => {
  try {
    const optReq = req as OptionalAuthRequest;
    const { slug } = req.params;

    console.log(`[Category] Fetching category: ${slug}`);

    // First try without is_active filter to find the category regardless of status
    let category = await Category.findOne({ slug });
    
    if (!category) {
      console.log(`Category "${slug}" not found in database at all.`);
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // If category is inactive, reactivate it
    if (!category.is_active) {
      console.log(`Category "${slug}" exists but is_active=${category.is_active}. Reactivating.`);
      category.is_active = true;
      await category.save();
    }

    console.log(`[Category] Found category: ${category.name}, fetching members`);

    // Fetch members with error handling
    let membersRaw: ICategoryMemberPopulatedUser[] = [];
    try {
      const foundMembers = await CategoryMember.find({
        category: category._id,
        status: 'approved',
      })
        .sort({ vote_count: -1 })
        .populate('user', 'handle display_name avatar_url bio followers_count') as unknown as ICategoryMemberPopulatedUser[];
      membersRaw = foundMembers;
    } catch (populateError) {
      console.error('[Category] Error populating members:', populateError);
      
      // Return early with empty members if population fails
      res.json({
        success: true,
        category: category.toObject(),
        members: [],
        total_members: 0,
        user_vote: null,
        user_membership: null,
      });
      return;
    }

    // Filter out orphaned members (user was deleted but membership remains) with explicit null checks
    const members = membersRaw.filter((m): m is ICategoryMemberPopulatedUser => {
      return m.user != null && typeof m.user === 'object' && '_id' in m.user;
    });

    // Clean up orphaned memberships in the background
    const orphanedCount = membersRaw.length - members.length;
    if (orphanedCount > 0) {
      const orphanedIds = membersRaw
        .filter((m) => !m.user || typeof m.user !== 'object' || !('_id' in m.user))
        .map((m) => m._id);
      console.log(`[Category] Cleaning up ${orphanedIds.length} orphaned memberships in category "${slug}"`);
      CategoryMember.deleteMany({ _id: { $in: orphanedIds } }).catch((err: unknown) =>
        console.error('[Category] Failed to clean orphaned memberships:', err)
      );
    }

    console.log(`[Category] Building leaderboard with ${members.length} valid members`);

    // Get user vote and membership with error handling
    let userVote: string | null = null;
    let userMembership: Awaited<ReturnType<typeof CategoryMember.findOne>> = null;
    
    if (optReq.user) {
      try {
        const vote = await Vote.findOne({
          voter: optReq.user._id,
          category: category._id,
        });
        userVote = vote ? vote.voted_for.toString() : null;

        userMembership = await CategoryMember.findOne({
          category: category._id,
          user: optReq.user._id,
        });
      } catch (voteError) {
        console.error('[Category] Error fetching user vote/membership:', voteError);
        // Continue without vote data
      }
    }

    // Build leaderboard with explicit error handling
    const leaderboard: LeaderboardEntry[] = [];
    for (let index = 0; index < members.length; index++) {
      try {
        const member = members[index];
        
        // Skip if user is still somehow null after our filter
        if (!member.user || !('handle' in member.user)) {
          console.warn(`[Category] Skipping member at index ${index} due to invalid user data`);
          continue;
        }

        let rank = index + 1;
        if (index > 0 && member.vote_count === members[index - 1].vote_count) {
          rank = leaderboard[index - 1]?.rank || index + 1;
        }

        const userId = member.user._id.toString();
        
        leaderboard.push({
          rank,
          user: {
            _id: member.user._id,
            handle: member.user.handle || '',
            display_name: member.user.display_name || '',
            avatar_url: member.user.avatar_url || '',
            bio: member.user.bio || '',
            followers_count: member.user.followers_count || 0,
          },
          vote_count: member.vote_count || 0,
          rank_change: member.rank_change || 0,
          is_voted: userVote === userId,
          is_self: optReq.user ? optReq.user._id.toString() === userId : false,
        });
      } catch (memberError) {
        console.error(`[Category] Error processing member at index ${index}:`, memberError);
        // Skip this member and continue
      }
    }

    console.log(`[Category] Successfully built leaderboard with ${leaderboard.length} entries`);

    res.json({
      success: true,
      category: category.toObject(),
      members: leaderboard,
      total_members: members.length,
      user_vote: userVote,
      user_membership: userMembership ? userMembership.status : null,
    });
  } catch (error) {
    console.error('[Category] Category detail error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Category] Error stack:', error instanceof Error ? error.stack : 'No stack');
    res.status(500).json({ error: 'Failed to fetch category', details: message });
  }
});

// Helper: forfeit all existing memberships and votes in other categories
async function forfeitExistingMemberships(userId: Types.ObjectId, excludeCategoryId: Types.ObjectId) {
  const existingMemberships = await CategoryMember.find({
    user: userId,
    category: { $ne: excludeCategoryId },
    status: { $in: ['approved', 'pending'] },
  });

  let totalVotesLost = 0;

  for (const membership of existingMemberships) {
    if (membership.status === 'approved') {
      // Delete all votes this user received in that category
      const votesReceived = await Vote.find({
        voted_for: userId,
        category: membership.category,
      });

      if (votesReceived.length > 0) {
        totalVotesLost += votesReceived.length;
        await Vote.deleteMany({
          voted_for: userId,
          category: membership.category,
        });
      }

      // Also delete any vote the user CAST in that category
      const voteCast = await Vote.findOne({
        voter: userId,
        category: membership.category,
      });
      if (voteCast) {
        await CategoryMember.updateOne(
          { category: membership.category, user: voteCast.voted_for },
          { $inc: { vote_count: -1 } }
        );
        await User.updateOne(
          { _id: voteCast.voted_for },
          { $inc: { total_votes_received: -1 } }
        );
        await Category.updateOne(
          { _id: membership.category },
          { $inc: { total_votes: -1 } }
        );
        await Vote.deleteOne({ _id: voteCast._id });
      }

      // Update user's total_votes_received and category counters
      if (votesReceived.length > 0) {
        await User.updateOne(
          { _id: userId },
          { $inc: { total_votes_received: -votesReceived.length } }
        );
        await Category.updateOne(
          { _id: membership.category },
          { $inc: { total_votes: -votesReceived.length, member_count: -1 } }
        );
      } else {
        await Category.updateOne(
          { _id: membership.category },
          { $inc: { member_count: -1 } }
        );
      }

      // Recalculate rankings for the old category
      await recalculateRankings(membership.category);
    }

    // Delete the membership record
    await CategoryMember.deleteOne({ _id: membership._id });
  }

  return { forfeitedCount: existingMemberships.length, totalVotesLost };
}

// Helper: create or re-activate membership in a category
async function createMembership(userId: Types.ObjectId, categoryId: Types.ObjectId, reason: string, isAdmin: boolean, followersCount: number) {
  const autoApprove = isAdmin || followersCount >= 500;
  const status = autoApprove ? 'approved' : 'pending';

  // Check for rejected membership in this category (allow re-application)
  const existingRejected = await CategoryMember.findOne({
    category: categoryId,
    user: userId,
    status: 'rejected',
  });

  if (existingRejected) {
    existingRejected.status = status;
    existingRejected.application_reason = reason;
    existingRejected.vote_count = 0;
    existingRejected.current_rank = null;
    existingRejected.previous_rank = null;
    existingRejected.rank_change = 0;
    existingRejected.approved_at = autoApprove ? new Date() : null;
    await existingRejected.save();
  } else {
    await CategoryMember.create({
      category: categoryId,
      user: userId,
      status,
      application_reason: reason,
      approved_at: autoApprove ? new Date() : null,
    });
  }

  if (autoApprove) {
    await Category.updateOne({ _id: categoryId }, { $inc: { member_count: 1 } });
    await recalculateRankings(categoryId);
  }

  return { status, autoApprove };
}

// POST /api/categories/:slug/apply - Apply to join category
// SINGLE-CATEGORY RULE: Users can only be in ONE category.
// If user is already in another category, returns requiresConfirmation with current category info.
// Admin (@codebynz) applications are auto-approved instantly.
router.post('/:slug/apply', authenticate as express.RequestHandler, async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { reason } = req.body as ApplyBody;
    const category = await Category.findOne({ slug: req.params.slug, is_active: true });
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // Validate reason
    if (!reason || reason.length < 20 || reason.length > 200) {
      res.status(400).json({
        success: false,
        error: 'Reason must be between 20 and 200 characters',
      });
      return;
    }

    // Check if user already has a membership in THIS category
    const existingInThis = await CategoryMember.findOne({
      category: category._id,
      user: authReq.user._id,
    });

    if (existingInThis) {
      if (existingInThis.status === 'approved') {
        res.status(409).json({ error: 'Already a member of this category' });
        return;
      }
      if (existingInThis.status === 'pending') {
        res.status(409).json({ error: 'Application already pending' });
        return;
      }
      // If rejected, allow re-application below
    }

    // SINGLE-CATEGORY RESTRICTION:
    // Check if user is already in ANY other category
    const existingMembership = await CategoryMember.findOne({
      user: authReq.user._id,
      category: { $ne: category._id },
      status: { $in: ['approved', 'pending'] },
    }).populate('category', 'name slug');

    if (existingMembership) {
      // User is already in a category - return confirmation requirement
      const oldCategory = existingMembership.category as any;
      res.status(400).json({
        success: false,
        message: `You are already in "${oldCategory.name}". To switch categories, you must forfeit all your votes and start from 0.`,
        currentCategory: {
          name: oldCategory.name,
          slug: oldCategory.slug,
          votes: existingMembership.vote_count,
          rank: existingMembership.current_rank,
        },
        requiresConfirmation: true,
      });
      return;
    }

    // No existing membership - proceed with normal application
    const isAdmin = authReq.user.is_admin;
    const { status, autoApprove } = await createMembership(
      authReq.user._id,
      category._id,
      reason,
      isAdmin,
      authReq.user.followers_count
    );

    res.status(201).json({
      success: true,
      message: autoApprove
        ? 'Application approved automatically. You are now in this category!'
        : 'Application submitted successfully. Awaiting approval.',
      status,
    });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// POST /api/categories/:slug/apply/confirm-switch - Confirm category switch with vote forfeiture
router.post('/:slug/apply/confirm-switch', authenticate as express.RequestHandler, async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { reason, confirmForfeit } = req.body as ApplyBody & { confirmForfeit?: boolean };

    // Must explicitly confirm
    if (!confirmForfeit) {
      res.status(400).json({
        success: false,
        error: 'You must confirm that you understand you will lose all votes',
      });
      return;
    }

    // Validate reason
    if (!reason || reason.length < 20 || reason.length > 200) {
      res.status(400).json({
        success: false,
        error: 'Reason must be between 20 and 200 characters',
      });
      return;
    }

    const category = await Category.findOne({ slug: req.params.slug, is_active: true });
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // Verify user actually has an existing membership
    const existingMembership = await CategoryMember.findOne({
      user: authReq.user._id,
      status: { $in: ['approved', 'pending'] },
    });

    if (!existingMembership) {
      res.status(400).json({
        success: false,
        error: 'No existing membership found. Use the normal apply endpoint.',
      });
      return;
    }

    // Forfeit all existing memberships
    const { totalVotesLost } = await forfeitExistingMemberships(authReq.user._id, category._id);

    // Create new membership
    const isAdmin = authReq.user.is_admin;
    const { autoApprove } = await createMembership(
      authReq.user._id,
      category._id,
      reason,
      isAdmin,
      authReq.user.followers_count
    );

    res.json({
      success: true,
      message: autoApprove
        ? `Successfully switched to "${category.name}". Your votes have been reset to 0.`
        : `Application to "${category.name}" submitted. Your votes have been reset to 0.`,
      oldVotesLost: totalVotesLost,
    });
  } catch (error) {
    console.error('Switch category error:', error);
    res.status(500).json({ error: 'Failed to switch category' });
  }
});

export default router;
