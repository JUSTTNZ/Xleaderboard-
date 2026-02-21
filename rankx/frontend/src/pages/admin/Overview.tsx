import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Users, ThumbsUp, Grid3X3, FileText, Trophy, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import AdminSidebar from '../../components/AdminSidebar';
import type { AdminOverview } from '../../types';

export default function AdminOverviewPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.is_admin) return;
    const fetch = async () => {
      try {
        const { data: res } = await api.get('/admin/overview');
        setData(res);
      } catch (error) {
        console.error('Failed to fetch admin overview:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  if (authLoading) return null;
  if (!user?.is_admin) return <Navigate to="/" replace />;

  const stats = data?.stats;

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
    { label: 'Total Votes', value: stats.totalVotes, icon: ThumbsUp, color: 'text-green-400' },
    { label: 'Active Categories', value: stats.totalCategories, icon: Grid3X3, color: 'text-purple-400' },
    { label: 'Pending Apps', value: stats.pendingApplications, icon: FileText, color: 'text-orange-400' },
    { label: 'Total Members', value: stats.totalMembers, icon: UserCheck, color: 'text-cyan-400' },
  ] : [];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-page-heading text-white mb-2">Admin Overview</h1>
            <p className="text-gray-400">Platform statistics and management</p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="h-6 w-6 bg-[#2A2A2A] rounded mb-3" />
                  <div className="h-8 w-16 bg-[#2A2A2A] rounded mb-2" />
                  <div className="h-4 w-20 bg-[#2A2A2A] rounded" />
                </div>
              ))}
            </div>
          ) : data ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-10">
                {statCards.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card p-5"
                  >
                    <s.icon size={20} className={`mb-3 ${s.color}`} />
                    <p className="text-2xl font-bold text-white">{s.value.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Admin's own ranking */}
              {data.adminProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="card p-6 mb-10 flex items-center gap-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <Trophy size={22} className="text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Your Rank in {data.adminProfile.category.name}</p>
                    <p className="text-2xl font-bold text-white">
                      {data.adminProfile.rank ? `#${data.adminProfile.rank}` : 'Unranked'}
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        ({data.adminProfile.votes} votes)
                      </span>
                    </p>
                  </div>
                  <Link
                    to={`/category/${data.adminProfile.category.slug}`}
                    className="ml-auto btn-secondary py-2 px-4 text-sm"
                  >
                    View Leaderboard
                  </Link>
                </motion.div>
              )}

              {/* Quick links */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
                {stats!.pendingApplications > 0 && (
                  <Link
                    to="/admin/applications"
                    className="card p-5 flex items-center gap-4 group cursor-pointer"
                  >
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-orange-900/20 border border-orange-800/30">
                      <FileText size={18} className="text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{stats!.pendingApplications} Pending Applications</p>
                      <p className="text-xs text-gray-500">Review and approve</p>
                    </div>
                  </Link>
                )}
                <Link
                  to="/admin/categories"
                  className="card p-5 flex items-center gap-4 group cursor-pointer"
                >
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-purple-900/20 border border-purple-800/30">
                    <Grid3X3 size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Manage Categories</p>
                    <p className="text-xs text-gray-500">Create, edit, toggle</p>
                  </div>
                </Link>
                <Link
                  to="/admin/users"
                  className="card p-5 flex items-center gap-4 group cursor-pointer"
                >
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-900/20 border border-blue-800/30">
                    <Users size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Manage Users</p>
                    <p className="text-xs text-gray-500">View all users</p>
                  </div>
                </Link>
              </div>

              {/* Recent users */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-xl font-bold text-white mb-5">Recent Users</h2>
                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#222] bg-[#0A0A0A]">
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">User</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Joined</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#222]">
                        {data.recentUsers.map((u) => (
                          <tr key={u._id} className="hover:bg-[#1A1A1A]/50 transition-colors">
                            <td className="px-5 py-3">
                              <Link to={`/profile/${u.handle}`} className="flex items-center gap-3 group">
                                <img src={u.avatar_url} alt="" className="h-8 w-8 rounded-full border border-[#333]" />
                                <div>
                                  <p className="text-sm font-medium text-white group-hover:text-gray-300 transition-colors">{u.display_name}</p>
                                  <p className="text-xs text-gray-500">@{u.handle}</p>
                                </div>
                              </Link>
                            </td>
                            <td className="px-5 py-3 text-xs text-gray-500">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-5 py-3">
                              {u.is_admin ? (
                                <span className="text-xs font-medium text-orange-400 bg-orange-900/20 border border-orange-800/30 px-2 py-1 rounded">Admin</span>
                              ) : (
                                <span className="text-xs text-gray-500">User</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            </>
          ) : (
            <div className="card p-16 text-center">
              <p className="text-gray-400">Failed to load data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
