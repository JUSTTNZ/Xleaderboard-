import mongoose, { Schema, Model } from 'mongoose';
import { IBadge, IUserBadge } from '../types';

const badgeSchema = new Schema<IBadge>({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String, default: 'Award' },
  color: { type: String, default: '#FFFFFF' },
  criteria_type: { type: String, enum: ['votes', 'rank', 'categories', 'special'], required: true },
  criteria_value: { type: Number, default: 0 },
}, { timestamps: true });

const Badge: Model<IBadge> = mongoose.model<IBadge>('Badge', badgeSchema);

export default Badge;

const userBadgeSchema = new Schema<IUserBadge>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  badge: { type: Schema.Types.ObjectId, ref: 'Badge', required: true },
  earned_at: { type: Date, default: Date.now },
}, { timestamps: true });

userBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });

export const UserBadge: Model<IUserBadge> = mongoose.model<IUserBadge>('UserBadge', userBadgeSchema);
