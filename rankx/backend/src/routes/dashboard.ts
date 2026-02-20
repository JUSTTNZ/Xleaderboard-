import express, { Request, Response } from 'express';
import CategoryMember from '../models/CategoryMember';
import Vote from '../models/Vote';
import { authenticate } from '../middleware/auth';
import { AuthenticatedRequest, ICategoryMemberPopulatedCategory, IVotePopulated } from '../types';

const router = express.Router();

// GET /api/dashboard - Get dashboard data for authenticated user
router.get('/', authenticate as express.RequestHandler, async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;

    // Get all memberships
    const memberships = await CategoryMember.find({
      user: authReq.user._id,
    }).populate('category', 'name slug icon color') as unknown as ICategoryMemberPopulatedCategory[];

    const approved = memberships.filter((m) => m.status === 'approved');
    const pending = memberships.filter((m) => m.status === 'pending');

    // Stats
    const totalVotes = approved.reduce((sum, m) => sum + m.vote_count, 0);
    const ranks = approved
      .filter((m) => m.current_rank !== null)
      .map((m) => m.current_rank as number);
    const highestRank = ranks.length > 0 ? Math.min(...ranks) : null;

    // Get user's votes
    const userVotes = await Vote.find({ voter: authReq.user._id })
      .populate('voted_for', 'handle display_name avatar_url')
      .populate('category', 'name slug icon') as unknown as IVotePopulated[];

    res.json({
      stats: {
        total_votes: totalVotes,
        categories_count: approved.length,
        highest_rank: highestRank,
        votes_cast: userVotes.length,
      },
      rankings: approved.map((m) => ({
        category: {
          name: m.category.name,
          slug: m.category.slug,
          icon: m.category.icon,
          color: m.category.color,
        },
        rank: m.current_rank,
        vote_count: m.vote_count,
        rank_change: m.rank_change,
      })),
      votes: userVotes.map((v) => ({
        category: {
          name: v.category.name,
          slug: v.category.slug,
          icon: v.category.icon,
        },
        voted_for: {
          handle: v.voted_for.handle,
          display_name: v.voted_for.display_name,
          avatar_url: v.voted_for.avatar_url,
        },
      })),
      pending_applications: pending.map((m) => ({
        category: {
          name: m.category.name,
          slug: m.category.slug,
          icon: m.category.icon,
        },
        applied_at: m.createdAt,
        reason: m.application_reason,
      })),
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
