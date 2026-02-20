import express, { Request, Response } from 'express';
import User from '../models/User';
import CategoryMember from '../models/CategoryMember';
import { UserBadge } from '../models/Badge';
import { ICategoryMemberPopulatedCategory, IUserBadgePopulated } from '../types';

const router = express.Router();

// GET /api/profile/:handle - Get user profile
router.get('/:handle', async (req: Request<{ handle: string }>, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ handle: req.params.handle });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get all approved category memberships
    const memberships = await CategoryMember.find({
      user: user._id,
      status: 'approved',
    }).populate('category', 'name slug icon color') as unknown as ICategoryMemberPopulatedCategory[];

    // Get total votes received
    const totalVotes = memberships.reduce((sum, m) => sum + m.vote_count, 0);

    // Find highest rank
    const ranks = memberships
      .filter((m) => m.current_rank !== null)
      .map((m) => m.current_rank as number);
    const highestRank = ranks.length > 0 ? Math.min(...ranks) : null;

    // Get badges
    const userBadges = await UserBadge.find({ user: user._id })
      .populate('badge') as unknown as IUserBadgePopulated[];

    const rankings = memberships.map((m) => ({
      category: {
        name: m.category.name,
        slug: m.category.slug,
        icon: m.category.icon,
        color: m.category.color,
      },
      rank: m.current_rank,
      vote_count: m.vote_count,
      rank_change: m.rank_change,
    }));

    res.json({
      user: {
        _id: user._id,
        handle: user.handle,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        followers_count: user.followers_count,
      },
      stats: {
        total_votes: totalVotes,
        categories_count: memberships.length,
        highest_rank: highestRank,
      },
      rankings,
      badges: userBadges.map((ub) => ({
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        color: ub.badge.color,
        earned_at: ub.earned_at,
      })),
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
