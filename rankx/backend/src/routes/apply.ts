import express, { Request, Response } from 'express';
import Category from '../models/Category';
import CategoryMember from '../models/CategoryMember';
import { authenticate } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

interface ApplyBody {
  category_slug: string;
  reason?: string;
}

// POST /api/apply - Apply to a category
router.post('/', authenticate as express.RequestHandler, async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { category_slug, reason } = req.body as ApplyBody;

    if (!category_slug) {
      res.status(400).json({ error: 'category_slug is required' });
      return;
    }

    // First try without is_active filter to find the category regardless of status
    let category = await Category.findOne({ slug: category_slug });
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // If category is inactive, reactivate it
    if (!category.is_active) {
      category.is_active = true;
      await category.save();
    }

    // Check if already a member or has pending application
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
        // Allow re-application
        existing.status = 'pending';
        existing.application_reason = reason || '';
        await existing.save();
        res.json({ message: 'Application re-submitted', status: 'pending' });
        return;
      }
    }

    await CategoryMember.create({
      category: category._id,
      user: authReq.user._id,
      status: category.requires_approval ? 'pending' : 'approved',
      application_reason: reason || '',
    });

    if (!category.requires_approval) {
      await Category.updateOne({ _id: category._id }, { $inc: { member_count: 1 } });
    }

    res.status(201).json({
      message: category.requires_approval
        ? 'Application submitted for review'
        : 'Joined category successfully',
      status: category.requires_approval ? 'pending' : 'approved',
    });
  } catch {
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

export default router;
