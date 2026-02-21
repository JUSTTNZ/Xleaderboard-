import express, { Request, Response } from 'express';
import Category from '../models/Category';
import CategoryMember from '../models/CategoryMember';
import Vote from '../models/Vote';
import User from '../models/User';
import { requireAdmin } from '../middleware/auth';
import { AuthenticatedRequest, ICategoryMemberPopulatedUser, ICategoryMemberFullyPopulated } from '../types';
import { recalculateRankings } from '../lib/rankings';

const router = express.Router();

// ─── GET /api/admin/overview ────────────────────────────
// Dashboard stats for admin panel
router.get('/overview', requireAdmin as express.RequestHandler, async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;

    const [totalUsers, totalCategories, totalVotes, pendingApplications, totalMembers] = await Promise.all([
      User.countDocuments(),
      Category.countDocuments({ is_active: true }),
      Vote.countDocuments(),
      CategoryMember.countDocuments({ status: 'pending' }),
      CategoryMember.countDocuments({ status: 'approved' }),
    ]);

    // Admin's own stats
    const adminMembership = await CategoryMember.findOne({
      user: authReq.user._id,
      status: 'approved',
    }).populate('category', 'name slug icon');

    // Recent users (last 10)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('handle display_name avatar_url createdAt is_admin');

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCategories,
        totalVotes,
        pendingApplications,
        totalMembers,
      },
      adminProfile: adminMembership ? {
        category: (adminMembership as any).category,
        rank: adminMembership.current_rank,
        votes: adminMembership.vote_count,
      } : null,
      recentUsers,
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

// ─── GET /api/admin/applications ────────────────────────
// List all pending applications
router.get('/applications', requireAdmin as express.RequestHandler, async (req: Request, res: Response): Promise<void> => {
  try {
    const status = (req.query.status as string) || 'pending';

    const applications = await CategoryMember.find({
      status,
    })
      .sort({ createdAt: -1 })
      .populate('user', 'handle display_name avatar_url bio followers_count is_admin')
      .populate('category', 'name slug icon') as unknown as ICategoryMemberFullyPopulated[];

    res.json({
      success: true,
      applications: applications.map((app) => ({
        _id: app._id,
        user: {
          _id: app.user._id,
          handle: app.user.handle,
          display_name: app.user.display_name,
          avatar_url: app.user.avatar_url,
          bio: app.user.bio,
          followers_count: app.user.followers_count,
          is_admin: app.user.is_admin,
        },
        category: {
          _id: app.category._id,
          name: app.category.name,
          slug: app.category.slug,
          icon: app.category.icon,
        },
        reason: app.application_reason,
        status: app.status,
        applied_at: app.createdAt,
      })),
    });
  } catch (error) {
    console.error('Admin applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// ─── POST /api/admin/applications/:id/approve ───────────
router.post('/applications/:id/approve', requireAdmin as express.RequestHandler, async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;

    const application = await CategoryMember.findById(id);
    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    if (application.status !== 'pending') {
      res.status(400).json({ error: `Application is already ${application.status}` });
      return;
    }

    // Admin cannot approve their own application
    if (application.user.toString() === authReq.user._id.toString()) {
      res.status(403).json({
        error: 'You cannot approve your own application',
      });
      return;
    }

    application.status = 'approved';
    application.approved_by = authReq.user._id;
    application.approved_at = new Date();
    await application.save();

    await Category.updateOne(
      { _id: application.category },
      { $inc: { member_count: 1 } }
    );

    await recalculateRankings(application.category);

    res.json({ success: true, message: 'Application approved' });
  } catch (error) {
    console.error('Admin approve error:', error);
    res.status(500).json({ error: 'Failed to approve application' });
  }
});

// ─── POST /api/admin/applications/:id/reject ────────────
router.post('/applications/:id/reject', requireAdmin as express.RequestHandler, async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;

    const application = await CategoryMember.findById(id);
    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    if (application.status !== 'pending') {
      res.status(400).json({ error: `Application is already ${application.status}` });
      return;
    }

    // Admin cannot reject their own application
    if (application.user.toString() === authReq.user._id.toString()) {
      res.status(403).json({
        error: 'You cannot reject your own application',
      });
      return;
    }

    application.status = 'rejected';
    await application.save();

    res.json({ success: true, message: 'Application rejected' });
  } catch (error) {
    console.error('Admin reject error:', error);
    res.status(500).json({ error: 'Failed to reject application' });
  }
});

// ─── GET /api/admin/users ───────────────────────────────
router.get('/users', requireAdmin as express.RequestHandler, async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('handle display_name avatar_url bio followers_count total_votes_received is_admin createdAt last_login');

    // Get category membership for each user
    const usersWithCategory = await Promise.all(
      users.map(async (u) => {
        const membership = await CategoryMember.findOne({
          user: u._id,
          status: 'approved',
        }).populate('category', 'name slug icon');

        return {
          ...u.toObject(),
          current_category: membership ? {
            name: (membership as any).category.name,
            slug: (membership as any).category.slug,
            icon: (membership as any).category.icon,
            rank: membership.current_rank,
            votes: membership.vote_count,
          } : null,
        };
      })
    );

    res.json({ success: true, users: usersWithCategory });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ─── DELETE /api/admin/users/:id ────────────────────────
router.delete('/users/:id', requireAdmin as express.RequestHandler, async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;

    // Prevent self-deletion
    if (id === authReq.user._id.toString()) {
      res.status(403).json({ error: 'You cannot delete your own account' });
      return;
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent deleting other admins
    if (targetUser.is_admin) {
      res.status(403).json({ error: 'Cannot delete another admin' });
      return;
    }

    // Remove all votes by this user
    const votesCast = await Vote.find({ voter: id });
    for (const vote of votesCast) {
      await CategoryMember.updateOne(
        { category: vote.category, user: vote.voted_for },
        { $inc: { vote_count: -1 } }
      );
      await User.updateOne(
        { _id: vote.voted_for },
        { $inc: { total_votes_received: -1 } }
      );
      await Category.updateOne(
        { _id: vote.category },
        { $inc: { total_votes: -1 } }
      );
    }
    await Vote.deleteMany({ voter: id });

    // Remove all votes for this user
    const votesReceived = await Vote.find({ voted_for: id });
    for (const vote of votesReceived) {
      await Category.updateOne(
        { _id: vote.category },
        { $inc: { total_votes: -1 } }
      );
    }
    await Vote.deleteMany({ voted_for: id });

    // Remove memberships and decrement member counts
    const memberships = await CategoryMember.find({ user: id, status: 'approved' });
    for (const m of memberships) {
      await Category.updateOne(
        { _id: m.category },
        { $inc: { member_count: -1 } }
      );
      await recalculateRankings(m.category);
    }
    await CategoryMember.deleteMany({ user: id });

    // Delete the user
    await User.deleteOne({ _id: id });

    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ─── GET /api/admin/categories ──────────────────────────
router.get('/categories', requireAdmin as express.RequestHandler, async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Admin categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ─── PUT /api/admin/categories/:id ──────────────────────
router.put('/categories/:id', requireAdmin as express.RequestHandler, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, icon, is_active } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (is_active !== undefined) category.is_active = is_active;

    await category.save();

    res.json({ success: true, category });
  } catch (error) {
    console.error('Admin update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// ─── POST /api/admin/categories ─────────────────────────
router.post('/categories', requireAdmin as express.RequestHandler, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, icon } = req.body;

    if (!name || !description) {
      res.status(400).json({ error: 'Name and description are required' });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await Category.findOne({ slug });
    if (existing) {
      res.status(409).json({ error: 'Category with this name already exists' });
      return;
    }

    const category = await Category.create({
      name,
      slug,
      description,
      icon: icon || 'Trophy',
      is_active: true,
      requires_approval: true,
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error('Admin create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

export default router;
