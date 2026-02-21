import { Types, Document } from 'mongoose';
import { Request } from 'express';

// ─── User ───────────────────────────────────────────────
export interface IUser extends Document {
  _id: Types.ObjectId;
  supabase_id: string;
  twitter_id: string;
  handle: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  followers_count: number;
  total_votes_received: number;
  is_admin: boolean;
  can_participate: boolean;
  last_login: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Category ───────────────────────────────────────────
export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  member_count: number;
  total_votes: number;
  is_active: boolean;
  requires_approval: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── CategoryMember ─────────────────────────────────────
export interface ICategoryMember extends Document {
  _id: Types.ObjectId;
  category: Types.ObjectId;
  user: Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  vote_count: number;
  current_rank: number | null;
  previous_rank: number | null;
  rank_change: number;
  application_reason: string;
  approved_by: Types.ObjectId | null;
  approved_at: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryMemberPopulatedUser extends Omit<ICategoryMember, 'user'> {
  user: IUser;
}

export interface ICategoryMemberPopulatedCategory extends Omit<ICategoryMember, 'category'> {
  category: ICategory;
}

export interface ICategoryMemberFullyPopulated extends Omit<ICategoryMember, 'user' | 'category'> {
  user: IUser;
  category: ICategory;
}

// ─── Vote ───────────────────────────────────────────────
export interface IVote extends Document {
  _id: Types.ObjectId;
  voter: Types.ObjectId;
  voted_for: Types.ObjectId;
  category: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVotePopulated extends Omit<IVote, 'voted_for' | 'category'> {
  voted_for: IUser;
  category: ICategory;
}

// ─── Badge ──────────────────────────────────────────────
export interface IBadge extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  tier: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: 'ranking' | 'votes' | 'engagement' | 'social' | 'special';
  criteria_type: 'votes' | 'rank' | 'categories' | 'special';
  criteria_value: number;
  points: number;
  is_secret: boolean;
  awarded_count: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserBadge extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  badge: Types.ObjectId;
  earned_at: Date;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserBadgePopulated extends Omit<IUserBadge, 'badge'> {
  badge: IBadge;
}

// ─── Auth ───────────────────────────────────────────────
export interface AuthenticatedRequest extends Request {
  user: IUser;
}

export interface OptionalAuthRequest extends Request {
  user: IUser | null;
}
