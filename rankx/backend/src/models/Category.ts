import mongoose, { Schema, Model } from 'mongoose';
import { ICategory } from '../types';

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String, default: 'Trophy' },
  color: { type: String, default: '#FFFFFF' },
  member_count: { type: Number, default: 0 },
  total_votes: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  requires_approval: { type: Boolean, default: true },
}, { timestamps: true });

// slug already has unique:true which creates an index
categorySchema.index({ is_active: 1 });

const Category: Model<ICategory> = mongoose.model<ICategory>('Category', categorySchema);

export default Category;
