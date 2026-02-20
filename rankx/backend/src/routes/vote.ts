import express, { Request, Response } from 'express';
import Vote from '../models/Vote';
import Category from '../models/Category';
import CategoryMember from '../models/CategoryMember';
import User from '../models/User';
import { authenticate } from '../middleware/auth';
import { AuthenticatedRequest, ICategoryMember } from '../types';
import { Types } from 'mongoose';

const router = express.Router();

interface VoteBody {
  category_id: string;
  voted_for_id: string;
}

async function recalculateRankings(categoryId: Types.ObjectId): Promise<void> {
  const members = await CategoryMember.find({
    category: categoryId,
    status: 'approved',
  }).sort({ vote_count: -1 }) as ICategoryMember[];

  let rank = 1;
  for (let i = 0; i < members.length; i++) {
    if (i > 0 && members[i].vote_count < members[i - 1].vote_count) {
      rank = i + 1;
    }
    const previousRank = members[i].current_rank;
    members[i].previous_rank = previousRank;
    members[i].current_rank = rank;
    members[i].rank_change = previousRank ? previousRank - rank : 0;
    await members[i].save();
  }
}

// POST /api/votes - Cast or change a vote
router.post('/', authenticate as express.RequestHandler, async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { category_id, voted_for_id } = req.body as VoteBody;

    if (!category_id || !voted_for_id) {
      res.status(400).json({ error: 'category_id and voted_for_id are required' });
      return;
    }

    if (authReq.user._id.toString() === voted_for_id) {
      res.status(400).json({ error: 'Cannot vote for yourself' });
      return;
    }

    const category = await Category.findOne({ _id: category_id, is_active: true });
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    const targetMember = await CategoryMember.findOne({
      category: category._id,
      user: voted_for_id,
      status: 'approved',
    });
    if (!targetMember) {
      res.status(404).json({ error: 'User is not a member of this category' });
      return;
    }

    const existingVote = await Vote.findOne({
      voter: authReq.user._id,
      category: category._id,
    });

    if (existingVote) {
      if (existingVote.voted_for.toString() === voted_for_id) {
        await Vote.deleteOne({ _id: existingVote._id });
        await CategoryMember.updateOne(
          { category: category._id, user: voted_for_id },
          { $inc: { vote_count: -1 } }
        );
        await Category.updateOne({ _id: category._id }, { $inc: { total_votes: -1 } });
        await User.updateOne({ _id: voted_for_id }, { $inc: { total_votes_received: -1 } });
        await recalculateRankings(category._id);
        res.json({ success: true, message: 'Vote removed', action: 'removed' });
        return;
      }

      const oldVotedFor = existingVote.voted_for;
      await CategoryMember.updateOne(
        { category: category._id, user: oldVotedFor },
        { $inc: { vote_count: -1 } }
      );
      await User.updateOne({ _id: oldVotedFor }, { $inc: { total_votes_received: -1 } });

      existingVote.voted_for = new Types.ObjectId(voted_for_id);
      await existingVote.save();

      await CategoryMember.updateOne(
        { category: category._id, user: voted_for_id },
        { $inc: { vote_count: 1 } }
      );
      await User.updateOne({ _id: voted_for_id }, { $inc: { total_votes_received: 1 } });
      await recalculateRankings(category._id);
      res.json({ success: true, message: 'Vote changed', action: 'changed' });
      return;
    }

    await Vote.create({
      voter: authReq.user._id,
      voted_for: voted_for_id,
      category: category._id,
    });

    await CategoryMember.updateOne(
      { category: category._id, user: voted_for_id },
      { $inc: { vote_count: 1 } }
    );
    await Category.updateOne({ _id: category._id }, { $inc: { total_votes: 1 } });
    await User.updateOne({ _id: voted_for_id }, { $inc: { total_votes_received: 1 } });
    await recalculateRankings(category._id);

    res.json({ success: true, message: 'Vote recorded successfully', action: 'voted' });
  } catch (error) {
    console.error('Vote error:', error);
    const mongoError = error as { code?: number };
    if (mongoError.code === 11000) {
      res.status(409).json({ error: 'Already voted in this category' });
      return;
    }
    res.status(500).json({ error: 'Failed to cast vote' });
  }
});

export default router;
