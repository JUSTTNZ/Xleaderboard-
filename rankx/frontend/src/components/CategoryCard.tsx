import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
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
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="card h-full flex flex-col rounded-xl p-6 transition-all duration-200 hover:shadow-lg hover:shadow-white/10"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2A2A2A]">
            <Icon name={category.icon} size={24} className="text-white" />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users size={14} />
            <span>{category.member_count} members</span>
          </div>
        </div>

        <h3 className="text-card-heading mb-2 font-semibold text-white">{category.name}</h3>
        <p className="flex-1 text-body-small mb-4 text-gray-400">{category.description}</p>

        {category.top_members && category.top_members.length > 0 && (
          <div className="flex items-center gap-1 pt-4 border-t border-[#222]">
            {category.top_members.slice(0, 3).map((member, i) => (
              <img
                key={i}
                src={member.avatar_url}
                alt={member.display_name}
                title={member.display_name}
                className="h-6 w-6 rounded-full border border-[#333]"
                style={{ marginLeft: i > 0 ? '-8px' : 0 }}
              />
            ))}
            {category.member_count > 3 && (
              <span className="ml-2 text-xs text-gray-500">
                +{category.member_count - 3}
              </span>
            )}
          </div>
        )}
      </motion.div>
    </Link>
  );
}
