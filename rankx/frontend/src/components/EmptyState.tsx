import { Link } from 'react-router-dom';
import { type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionUrl }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-16 text-center"
    >
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1A1A1A] border border-[#333]">
        <Icon size={40} className="text-gray-600" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-body-small text-gray-400 mb-8 max-w-sm mx-auto">{description}</p>
      {actionLabel && actionUrl && (
        <Link to={actionUrl} className="btn-primary inline-flex">
          {actionLabel}
        </Link>
      )}
    </motion.div>
  );
}
