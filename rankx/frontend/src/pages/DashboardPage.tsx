import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Loader2, BarChart3, FolderOpen, Trophy, Vote, TrendingUp, TrendingDown, Minus, Clock, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import Icon from '../components/Icon';
import type { DashboardData } from '../types';

interface StatItem {
  icon: LucideIcon;
  label: string;
  value: string | number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setDashboard(data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-400">Failed to load dashboard.</p>
      </div>
    );
  }

  const { stats, rankings, votes, pending_applications } = dashboard;

  const statItems: StatItem[] = [
    { icon: BarChart3, label: 'Votes Received', value: stats.total_votes },
    { icon: FolderOpen, label: 'Categories', value: stats.categories_count },
    { icon: Trophy, label: 'Highest Rank', value: stats.highest_rank ? `#${stats.highest_rank}` : '-' },
    { icon: Vote, label: 'Votes Cast', value: stats.votes_cast },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-page-heading mb-2 text-white">Dashboard</h1>
        <p className="text-subheading text-gray-400">
          Welcome back, <span className="font-semibold text-white">{user.display_name}</span>
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* My Rankings Section */}
      {rankings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-section-heading mb-6 text-white">My Rankings</h2>
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
                        <span className="inline-block font-bold text-white text-lg">
                          {r.rank ? `#${r.rank}` : '-'}
                        </span>
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

      {/* My Votes Section */}
      {votes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-section-heading mb-6 text-white">My Votes</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {votes.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card p-5 flex items-center gap-4 hover:shadow-lg hover:shadow-white/10 transition-all"
              >
                <img
                  src={v.voted_for.avatar_url}
                  alt={v.voted_for.display_name}
                  className="h-12 w-12 rounded-full border-2 border-[#333] flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-body font-semibold text-white truncate">
                    {v.voted_for.display_name}
                  </p>
                  <p className="text-caption text-gray-500 truncate">
                    @{v.voted_for.handle}
                  </p>
                </div>
                <Link
                  to={`/category/${v.category.slug}`}
                  className="text-caption text-gray-400 hover:text-white transition-colors flex items-center gap-1 flex-shrink-0"
                  title={v.category.name}
                >
                  <Icon name={v.category.icon} size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Pending Applications Section */}
      {pending_applications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-section-heading mb-6 text-white">Pending Applications</h2>
          <div className="space-y-4">
            {pending_applications.map((app, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-[#2A2A2A]">
                    <Icon name={app.category.icon} size={20} className="text-gray-400" />
                  </div>
                  <span className="text-body font-semibold text-white">
                    {app.category.name}
                  </span>
                </div>
                <span className="inline-flex items-center gap-2 rounded-lg bg-orange-900/30 border border-orange-800 text-orange-400 px-4 py-2 text-sm font-medium flex-shrink-0">
                  <Clock size={14} />
                  Pending
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {rankings.length === 0 && votes.length === 0 && pending_applications.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-16 text-center"
        >
          <FolderOpen size={48} className="mx-auto mb-6 text-gray-700" />
          <p className="text-body text-gray-400 mb-6">
            You haven't joined any categories yet.
          </p>
          <Link
            to="/categories"
            className="btn-primary inline-flex"
          >
            <FolderOpen size={18} />
            Browse Categories
          </Link>
        </motion.div>
      )}
    </div>
  );
}
