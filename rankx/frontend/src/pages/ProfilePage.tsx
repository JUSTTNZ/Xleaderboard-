import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ExternalLink, Trophy, BarChart3, FolderOpen, TrendingUp, TrendingDown, Minus, Award, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import Icon from '../components/Icon';
import type { ProfileData } from '../types';

interface StatItem {
  icon: LucideIcon;
  label: string;
  value: string | number;
}

export default function ProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get(`/profile/${handle}`);
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [handle]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-400">User not found.</p>
      </div>
    );
  }

  const { user, stats, rankings, badges } = profile;

  const statItems: StatItem[] = [
    { icon: BarChart3, label: 'Total Votes', value: stats.total_votes },
    { icon: FolderOpen, label: 'Categories', value: stats.categories_count },
    { icon: Trophy, label: 'Highest Rank', value: stats.highest_rank ? `#${stats.highest_rank}` : '-' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 card p-8"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={user.avatar_url}
            alt={user.display_name}
            className="h-32 w-32 rounded-full border-4 border-[#333]"
          />
          <div className="flex-1">
            <h1 className="text-page-heading mb-2 text-white">
              {user.display_name}
            </h1>
            <p className="text-subheading mb-3 text-gray-400">@{user.handle}</p>
            {user.bio && (
              <p className="text-body mb-6 max-w-2xl text-gray-400">{user.bio}</p>
            )}
            <a
              href={`https://x.com/${user.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 btn-secondary px-6 py-3"
            >
              <ExternalLink size={16} />
              View on X
            </a>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statItems.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="card p-6 flex flex-col"
          >
            <stat.icon size={24} className="mb-3 text-gray-600" />
            <span className="text-4xl font-bold text-white mb-1">{stat.value}</span>
            <span className="text-body-small text-gray-400">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Rankings Section */}
      {rankings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-section-heading mb-6 text-white">Rankings</h2>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#222] bg-[#0A0A0A]">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Rank</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Votes</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {rankings.map((r, i) => (
                    <motion.tr
                      key={r.category.slug}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-[#1A1A1A] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          to={`/category/${r.category.slug}`}
                          className="flex items-center gap-3 text-white hover:text-gray-300 transition-colors group"
                        >
                          <div className="h-8 w-8 flex items-center justify-center rounded bg-[#2A2A2A] group-hover:bg-[#3A3A3A] transition-colors">
                            <Icon name={r.category.icon} size={16} className="text-gray-400" />
                          </div>
                          {r.category.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block font-bold text-white text-lg">{r.rank ? `#${r.rank}` : '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-400">
                        {r.vote_count}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {r.rank_change > 0 ? (
                          <span className="inline-flex items-center gap-1 text-green-500 font-semibold">
                            <TrendingUp size={16} />
                            +{r.rank_change}
                          </span>
                        ) : r.rank_change < 0 ? (
                          <span className="inline-flex items-center gap-1 text-red-500 font-semibold">
                            <TrendingDown size={16} />
                            {r.rank_change}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-500">
                            <Minus size={16} />
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Badges Section */}
      {badges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-section-heading mb-6 text-white">Badges</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {badges.map((badge, i) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="card p-6 flex flex-col items-center text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#2A2A2A] mb-4">
                  <Award size={24} className="text-white" />
                </div>
                <p className="text-body font-semibold text-white mb-1">{badge.name}</p>
                <p className="text-caption text-gray-400">{badge.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {rankings.length === 0 && badges.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-16 text-center"
        >
          <Trophy size={48} className="mx-auto mb-6 text-gray-700" />
          <p className="text-body text-gray-400">
            No rankings or badges yet. Apply to categories to get started!
          </p>
        </motion.div>
      )}
    </div>
  );
}
