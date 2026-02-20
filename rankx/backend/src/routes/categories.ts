import express, { Request, Response } from 'express';
import Category from '../models/Category';
import CategoryMember from '../models/CategoryMember';
import Vote from '../models/Vote';
import { optionalAuth, authenticate } from '../middleware/auth';
import { AuthenticatedRequest, OptionalAuthRequest, ICategoryMemberPopulatedUser } from '../types';

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
    const category = await Category.findOne({ slug: req.params.slug, is_active: true });
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    const members = await CategoryMember.find({
      category: category._id,
      status: 'approved',
    })
      .sort({ vote_count: -1 })
      .populate('user', 'handle display_name avatar_url bio followers_count') as unknown as ICategoryMemberPopulatedUser[];

    let userVote: string | null = null;
    let userMembership: Awaited<ReturnType<typeof CategoryMember.findOne>> = null;
    if (optReq.user) {
      const vote = await Vote.findOne({
        voter: optReq.user._id,
        category: category._id,
      });
      userVote = vote ? vote.voted_for.toString() : null;

      userMembership = await CategoryMember.findOne({
        category: category._id,
        user: optReq.user._id,
      });
    }

    const leaderboard: LeaderboardEntry[] = members.map((member, index) => {
      let rank = index + 1;
      if (index > 0 && member.vote_count === members[index - 1].vote_count) {
        rank = leaderboard[index - 1]?.rank || index + 1;
      }
      return {
        rank,
        user: {
          _id: member.user._id,
          handle: member.user.handle,
          display_name: member.user.display_name,
          avatar_url: member.user.avatar_url,
          bio: member.user.bio,
          followers_count: member.user.followers_count,
        },
        vote_count: member.vote_count,
        rank_change: member.rank_change,
        is_voted: userVote === member.user._id.toString(),
        is_self: optReq.user ? optReq.user._id.toString() === member.user._id.toString() : false,
      };
    });

    res.json({
      success: true,
      category: category.toObject(),
      members: leaderboard,
      total_members: members.length,
      user_vote: userVote,
      user_membership: userMembership ? userMembership.status : null,
    });
  } catch (error) {
    console.error('Category detail error:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// POST /api/categories/:slug/apply - Apply to join category
router.post('/:slug/apply', authenticate as express.RequestHandler, async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { reason } = req.body as ApplyBody;
    const category = await Category.findOne({ slug: req.params.slug, is_active: true });
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    const existing = await CategoryMember.findOne({
      category: category._id,
      user: authReq.user._id,
    });

    if (existing) {
      if (existing.status === 'approved') {
        res.status(409).json({ error: 'Already a member of this category' });
        return;
      }
      if (existing.status === 'pending') {
        res.status(409).json({ error: 'Application already pending' });
        return;
      }
      if (existing.status === 'rejected') {
        existing.status = 'pending';
        existing.application_reason = reason || '';
        await existing.save();
        res.json({ success: true, message: 'Application re-submitted', status: 'pending' });
        return;
      }
    }

    const autoApprove = authReq.user.followers_count >= 500;
    const status = autoApprove ? 'approved' : 'pending';

    await CategoryMember.create({
      category: category._id,
      user: authReq.user._id,
      status,
      application_reason: reason || '',
      approved_at: autoApprove ? new Date() : null,
    });

    if (autoApprove) {
      await Category.updateOne({ _id: category._id }, { $inc: { member_count: 1 } });
    }

    res.status(201).json({
      success: true,
      message: autoApprove ? 'Joined category successfully' : 'Application submitted for review',
      status,
    });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

export default router;
