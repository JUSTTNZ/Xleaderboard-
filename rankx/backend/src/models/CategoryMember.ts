import mongoose, { Schema, Model } from 'mongoose';
import { ICategoryMember } from '../types';

const categoryMemberSchema = new Schema<ICategoryMember>({
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  vote_count: { type: Number, default: 0 },
  current_rank: { type: Number, default: null },
  previous_rank: { type: Number, default: null },
  rank_change: { type: Number, default: 0 },
  application_reason: { type: String, default: '' },
  approved_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  approved_at: { type: Date, default: null },
}, { timestamps: true });

categoryMemberSchema.index({ category: 1, user: 1 }, { unique: true });
categoryMemberSchema.index({ category: 1, status: 1, vote_count: -1 });
categoryMemberSchema.index({ user: 1, status: 1 });

const CategoryMember: Model<ICategoryMember> = mongoose.model<ICategoryMember>('CategoryMember', categoryMemberSchema);

export default CategoryMember;
