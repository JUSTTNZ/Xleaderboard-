import express, { Request, Response } from 'express';
import Category from '../models/Category';
import CategoryMember from '../models/CategoryMember';
import Vote from '../models/Vote';
import { optionalAuth } from '../middleware/auth';
import { OptionalAuthRequest, ICategoryMemberPopulatedUser } from '../types';

const router = express.Router();

// GET /api/leaderboard/:slug - Get leaderboard for a category
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

    // Get current user's vote in this category
    let userVote: string | null = null;
    if (optReq.user) {
      const vote = await Vote.findOne({
        voter: optReq.user._id,
        category: category._id,
      });
      userVote = vote ? vote.voted_for.toString() : null;
    }

    const leaderboard = members.map((member, index) => ({
      rank: index + 1,
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
    }));

    res.json({
      category: category.toObject(),
      leaderboard,
      total_members: members.length,
      user_has_voted: !!userVote,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
