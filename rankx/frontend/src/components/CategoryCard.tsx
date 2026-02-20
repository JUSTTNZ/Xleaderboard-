import { Link } from 'react-router-dom';
import { Users, ArrowUpRight, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Icon from './Icon';
import type { Category } from '../types';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link to={`/category/${category.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="card-interactive h-full flex flex-col rounded-xl p-6 group"
      >
        {/* Header row */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A0A0A] border border-[#333] group-hover:border-[#444] transition-colors">
            <Icon name={category.icon} size={24} className="text-white" />
          </div>
          <ArrowUpRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
        </div>

        {/* Name & description */}
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-gray-100 transition-colors">
          {category.name}
        </h3>
        <p className="flex-1 text-sm text-gray-500 mb-5 leading-relaxed line-clamp-2">
          {category.description}
        </p>

        {/* Footer stats */}
        <div className="flex items-center justify-between pt-4 border-t border-[#222]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Users size={13} />
              {category.member_count}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <ThumbsUp size={13} />
              {category.total_votes}
            </span>
          </div>

          {/* Top members avatars */}
          {category.top_members && category.top_members.length > 0 && (
            <div className="flex items-center">
              {category.top_members.slice(0, 3).map((member, i) => (
                <img
                  key={i}
                  src={member.avatar_url}
                  alt={member.display_name}
                  title={member.display_name}
                  className="h-6 w-6 rounded-full border-2 border-[#1A1A1A]"
                  style={{ marginLeft: i > 0 ? '-6px' : 0 }}
                />
              ))}
              {category.member_count > 3 && (
                <span className="ml-1.5 text-[10px] text-gray-600 font-medium">
                  +{category.member_count - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
