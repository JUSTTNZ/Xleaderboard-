import CategoryMember from '../models/CategoryMember';
import { ICategoryMember } from '../types';
import { Types } from 'mongoose';

export async function recalculateRankings(categoryId: Types.ObjectId): Promise<void> {
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
