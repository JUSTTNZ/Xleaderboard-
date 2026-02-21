import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '../types';

const userSchema = new Schema<IUser>({
  supabase_id: { type: String, required: true, unique: true },
  twitter_id: { type: String, unique: true, sparse: true },
  handle: { type: String, required: true, unique: true },
  display_name: { type: String, required: true },
  avatar_url: { type: String, default: '' },
  bio: { type: String, default: '' },
  followers_count: { type: Number, default: 0 },
  total_votes_received: { type: Number, default: 0 },
  is_admin: { type: Boolean, default: false },
  can_participate: { type: Boolean, default: true },
  last_login: { type: Date, default: Date.now },
}, { timestamps: true });

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
