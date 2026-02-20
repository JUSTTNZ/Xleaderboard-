import mongoose, { Schema, Model } from 'mongoose';
import { IVote } from '../types';

const voteSchema = new Schema<IVote>({
  voter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  voted_for: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
}, { timestamps: true });

// One vote per voter per category
voteSchema.index({ voter: 1, category: 1 }, { unique: true });
voteSchema.index({ voted_for: 1, category: 1 });
voteSchema.index({ category: 1 });

const Vote: Model<IVote> = mongoose.model<IVote>('Vote', voteSchema);

export default Vote;
