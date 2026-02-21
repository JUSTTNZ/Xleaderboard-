import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { BarChart3, FolderOpen, Trophy, Vote, TrendingUp, TrendingDown, Minus, Clock, ArrowRight, Sparkles, Shield, Settings, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import Icon from '../components/Icon';
import Sidebar from '../components/Sidebar';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import type { DashboardData } from '../types';

interface StatItem {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
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
        <div className="h-8 w-8 border-2 border-[#333] border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const statItems: StatItem[] = dashboard ? [
    { icon: BarChart3, label: 'Votes Received', value: dashboard.stats.total_votes, color: 'text-blue-400' },
    { icon: FolderOpen, label: 'Categories', value: dashboard.stats.categories_count, color: 'text-purple-400' },
    { icon: Trophy, label: 'Highest Rank', value: dashboard.stats.highest_rank ? `#${dashboard.stats.highest_rank}` : '-', color: 'text-yellow-500' },
    { icon: Vote, label: 'Votes Cast', value: dashboard.stats.votes_cast, color: 'text-green-400' },
  ] : [];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 relative overflow-hidden"
          >
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent pointer-events-none" />
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-white/[0.03] to-transparent rounded-full blur-2xl pointer-events-none" />

            <img
              src={user.avatar_url}
              alt={user.display_name}
              className="h-16 w-16 rounded-2xl border-2 border-[#333] relative z-10"
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={16} className="text-yellow-500" />
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Welcome back, {user.display_name}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Here's an overview of your activity and rankings.
              </p>
            </div>
          </motion.div>

          {/* Admin banner */}
          {user.is_admin && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-8 rounded-xl bg-orange-900/15 border border-orange-800/30 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-orange-400" />
                <div>
                  <p className="text-sm font-semibold text-orange-400">Admin Access</p>
                  <p className="text-xs text-gray-500">You have administrative privileges</p>
                </div>
              </div>
              <Link
                to="/admin/overview"
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Settings size={14} />
                Admin Dashboard
              </Link>
            </motion.div>
          )}

          {loading ? (
            <DashboardSkeleton />
          ) : !dashboard ? (
            <div className="card p-16 text-center">
              <p className="text-gray-400">Failed to load dashboard data.</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statItems.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card p-5 flex items-center gap-4 group"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A0A0A] border border-[#333] group-hover:border-[#444] transition-colors ${stat.color}`}>
                      <stat.icon size={22} />
                    </div>
                    <div>
                      <span className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Two-column layout */}
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Rankings - takes 2 columns */}
                <div className="lg:col-span-2">
                  {dashboard.rankings.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mb-8"
                    >
                      <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-white">My Rankings</h2>
                        <Link
                          to="/categories"
                          className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                        >
                          View all <ArrowRight size={12} />
                        </Link>
                      </div>
                      <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-[#222] bg-[#0A0A0A]">
                                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
                                <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Rank</th>
                                <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Votes</th>
                                <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Trend</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#222]">
                              {dashboard.rankings.map((r, i) => (
                                <motion.tr
                                  key={r.category.slug}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: i * 0.03 }}
                                  className="hover:bg-[#1A1A1A]/50 transition-colors"
                                >
                                  <td className="px-5 py-3.5">
                                    <Link
                                      to={`/category/${r.category.slug}`}
                                      className="flex items-center gap-3 text-white hover:text-gray-300 transition-colors group"
                                    >
                                      <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#2A2A2A] group-hover:bg-[#3A3A3A] transition-colors">
                                        <Icon name={r.category.icon} size={14} className="text-gray-400" />
                                      </div>
                                      <span className="text-sm font-medium">{r.category.name}</span>
                                    </Link>
                                  </td>
                                  <td className="px-5 py-3.5 text-center">
                                    <span className={`inline-flex items-center justify-center h-7 w-10 rounded text-xs font-bold ${
                                      r.rank === 1 ? 'bg-yellow-500/10 text-yellow-500' :
                                      r.rank === 2 ? 'bg-gray-400/10 text-gray-400' :
                                      r.rank === 3 ? 'bg-orange-500/10 text-orange-500' :
                                      'text-white'
                                    }`}>
                                      {r.rank ? `#${r.rank}` : '-'}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3.5 text-center text-sm text-gray-400">
                                    {r.vote_count}
                                  </td>
                                  <td className="px-5 py-3.5 text-center">
                                    {r.rank_change > 0 ? (
                                      <span className="inline-flex items-center gap-1 text-green-500 text-xs font-medium">
                                        <TrendingUp size={12} /> +{r.rank_change}
                                      </span>
                                    ) : r.rank_change < 0 ? (
                                      <span className="inline-flex items-center gap-1 text-red-500 text-xs font-medium">
                                        <TrendingDown size={12} /> {r.rank_change}
                                      </span>
                                    ) : (
                                      <span className="text-gray-500"><Minus size={12} className="mx-auto" /></span>
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

                  {/* My Votes */}
                  {dashboard.votes.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h2 className="text-xl font-bold text-white mb-5">My Votes</h2>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {dashboard.votes.map((v, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="card p-4 flex items-center gap-3.5 group"
                          >
                            <img
                              src={v.voted_for.avatar_url}
                              alt={v.voted_for.display_name}
                              className="h-10 w-10 rounded-full border-2 border-[#333] flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {v.voted_for.display_name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                @{v.voted_for.handle}
                              </p>
                            </div>
                            <Link
                              to={`/category/${v.category.slug}`}
                              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors flex-shrink-0 bg-[#0A0A0A] border border-[#333] rounded-lg px-2.5 py-1.5"
                              title={v.category.name}
                            >
                              <Icon name={v.category.icon} size={12} />
                              <span className="hidden sm:inline">{v.category.name}</span>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Right Column - Pending + Quick Actions */}
                <div className="space-y-8">
                  {/* Pending Applications */}
                  {dashboard.pending_applications.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <h2 className="text-lg font-bold text-white mb-4">Pending Applications</h2>
                      <div className="space-y-3">
                        {dashboard.pending_applications.map((app, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="card p-4 flex items-center gap-3"
                          >
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#0A0A0A] border border-[#333]">
                              <Icon name={app.category.icon} size={16} className="text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{app.category.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                                <span className="text-xs text-orange-400">Pending</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                      <Link
                        to="/categories"
                        className="card p-4 flex items-center gap-3 group cursor-pointer"
                      >
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#0A0A0A] border border-[#333] group-hover:border-[#444] transition-colors">
                          <FolderOpen size={16} className="text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">Browse Categories</p>
                          <p className="text-xs text-gray-500">Find new categories to join</p>
                        </div>
                        <ArrowRight size={14} className="text-gray-600 group-hover:text-white transition-colors" />
                      </Link>
                      <Link
                        to={`/profile/${user.handle}`}
                        className="card p-4 flex items-center gap-3 group cursor-pointer"
                      >
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#0A0A0A] border border-[#333] group-hover:border-[#444] transition-colors">
                          <Trophy size={16} className="text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">View Profile</p>
                          <p className="text-xs text-gray-500">See your public profile</p>
                        </div>
                        <ArrowRight size={14} className="text-gray-600 group-hover:text-white transition-colors" />
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Empty State */}
              {dashboard.rankings.length === 0 && dashboard.votes.length === 0 && dashboard.pending_applications.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-16 text-center"
                >
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0A0A0A] border border-[#333]">
                    <FolderOpen size={36} className="text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Get Started</h3>
                  <p className="text-sm text-gray-400 mb-8 max-w-sm mx-auto">
                    You haven't joined any categories yet. Browse categories and apply to start climbing the ranks.
                  </p>
                  <Link to="/categories" className="btn-primary inline-flex">
                    <FolderOpen size={18} />
                    Browse Categories
                  </Link>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
