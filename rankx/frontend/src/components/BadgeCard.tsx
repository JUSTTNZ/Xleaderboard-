import { motion } from 'framer-motion';
import Icon from './Icon';
import { Lock } from 'lucide-react';

interface BadgeCardProps {
  badge: {
    _id?: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    tier: string;
    earned?: boolean;
    earned_at?: Date | string;
    is_secret?: boolean;
  };
  size?: 'sm' | 'md' | 'lg';
}

const tierColors: Record<string, string> = {
  common: 'bg-gray-800/50 border-gray-700',
  uncommon: 'bg-green-900/20 border-green-800',
  rare: 'bg-blue-900/20 border-blue-800',
  epic: 'bg-purple-900/20 border-purple-800',
  legendary: 'bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-800'
};

const iconColors: Record<string, string> = {
  gray: 'text-gray-400',
  green: 'text-green-400',
  blue: 'text-blue-400',
  purple: 'text-purple-400',
  gold: 'text-yellow-400',
  orange: 'text-orange-400',
  red: 'text-red-400'
};

export default function BadgeCard({ badge, size = 'md' }: BadgeCardProps) {
  const isLocked = !badge.earned && badge.is_secret;
  
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const iconSize = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className={`
        ${tierColors[badge.tier] || tierColors.common}
        border rounded-xl ${sizeClasses[size]} relative overflow-hidden
        ${badge.earned ? '' : 'opacity-50 grayscale'}
        transition-all duration-200
      `}
    >
      {/* Tier indicator */}
      <div className="absolute top-2 right-2">
        <span className="text-xs font-semibold uppercase opacity-50 tracking-wider">
          {badge.tier}
        </span>
      </div>

      {/* Icon */}
      <div className="flex justify-center mb-3">
        <div className={`
          p-3 rounded-full
          ${badge.tier === 'legendary' ? 'bg-gradient-to-br from-yellow-600/30 to-orange-600/30' : 'bg-black/30'}
        `}>
          {isLocked ? (
            <Lock className={`${iconSize[size]} text-gray-600`} />
          ) : (
            <Icon 
              name={badge.icon} 
              className={`${iconSize[size]} ${iconColors[badge.color] || iconColors.gray}`}
            />
          )}
        </div>
      </div>

      {/* Name */}
      <h3 className="text-center font-semibold mb-1 text-sm">
        {isLocked ? '???' : badge.name}
      </h3>

      {/* Description */}
      <p className="text-xs text-gray-400 text-center mb-2 line-clamp-2">
        {isLocked ? 'Secret badge - earn it to reveal!' : badge.description}
      </p>

      {/* Earned date */}
      {badge.earned && badge.earned_at && (
        <div className="text-xs text-center text-gray-500 mt-2">
          Earned {new Date(badge.earned_at).toLocaleDateString()}
        </div>
      )}

      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center">
        </div>
      )}
    </motion.div>
  );
}
