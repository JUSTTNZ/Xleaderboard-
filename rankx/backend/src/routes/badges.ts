import express, { Request, Response } from 'express';
import Badge, { UserBadge } from '../models/Badge';
import { authenticate } from '../middleware/auth';
import { AuthenticatedRequest, OptionalAuthRequest } from '../types';
import { Types } from 'mongoose';

const router = express.Router();

// GET /api/badges
// Get all badges (with user's progress if authenticated)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const badges = await Badge.find().sort({ tier: -1, category: 1 });

    // If authenticated, include user's earned badges
    const authHeader = req.headers.authorization;
    let earnedBadgeIds: string[] = [];
    let userBadges: any[] = [];

    if (authHeader) {
      try {
        const authReq = req as OptionalAuthRequest;
        if (authReq.user) {
          const userBadgesDocs = await UserBadge.find({ user: authReq.user._id })
            .populate('badge');
          
          userBadges = userBadgesDocs as any;
          earnedBadgeIds = userBadgesDocs.map((ub: any) => ub.badge._id.toString());
        }
      } catch (err) {
        // Not authenticated or error, return without progress
      }
    }

    const badgesWithProgress = badges.map((badge: any) => ({
      _id: badge._id,
      name: badge.name,
      slug: badge.slug,
      description: badge.description,
      icon: badge.icon,
      color: badge.color,
      tier: badge.tier,
      category: badge.category,
      points: badge.points,
      is_secret: badge.is_secret,
      awarded_count: badge.awarded_count,
      earned: earnedBadgeIds.includes(badge._id.toString()),
      earned_at: userBadges.find((ub: any) => ub.badge._id.toString() === badge._id.toString())?.earned_at
    }));

    res.json({ success: true, badges: badgesWithProgress });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch badges' });
  }
});

// GET /api/badges/user/:userId
// Get badges for specific user
router.get('/user/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const userIdParam = req.params.userId;
    const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      res.status(400).json({ success: false, message: 'Invalid user ID' });
      return;
    }

    const userBadges = await UserBadge.find({ user: new Types.ObjectId(userId) })
      .populate('badge')
      .sort('-earned_at');

    res.json({
      success: true,
      badges: userBadges.map((ub: any) => ({
        _id: ub.badge._id,
        name: ub.badge.name,
        slug: ub.badge.slug,
        description: ub.badge.description,
        icon: ub.badge.icon,
        color: ub.badge.color,
        tier: ub.badge.tier,
        category: ub.badge.category,
        points: ub.badge.points,
        is_secret: ub.badge.is_secret,
        earned_at: ub.earned_at
      }))
    });
  } catch (error) {
    console.error('Get user badges error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user badges' });
  }
});

// GET /api/badges/leaderboard
// Badge leaderboard (users with most badges)
router.get('/leaderboard', async (req: Request, res: Response): Promise<void> => {
  try {
    const leaderboard = await UserBadge.aggregate([
      {
        $group: {
          _id: '$user',
          badge_count: { $sum: 1 },
          badges: { $push: '$badge' }
        }
      },
      { $sort: { badge_count: -1 } },
      { $limit: 100 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          'user.handle': 1,
          'user.display_name': 1,
          'user.avatar_url': 1,
          badge_count: 1
        }
      }
    ]);

    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Get badge leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
});

export default router;
