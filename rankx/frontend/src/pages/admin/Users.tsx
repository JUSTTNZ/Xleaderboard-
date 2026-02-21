import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Trash2, Shield, ExternalLink, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/Toast';
import AdminSidebar from '../../components/AdminSidebar';
import Icon from '../../components/Icon';
import type { AdminUser } from '../../types';

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.is_admin) return;
    const fetch = async () => {
      try {
        const { data } = await api.get('/admin/users');
        setUsers(data.users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const handleDelete = async (id: string, handle: string) => {
    if (!confirm(`Delete user @${handle}? This will remove all their votes, memberships, and data. This cannot be undone.`)) return;

    setDeleting(id);
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast('success', `User @${handle} deleted`);
    } catch (error: any) {
      toast('error', error?.response?.data?.error || 'Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  if (authLoading) return null;
  if (!user?.is_admin) return <Navigate to="/" replace />;

  const filtered = search.trim()
    ? users.filter((u) =>
        u.handle.toLowerCase().includes(search.toLowerCase()) ||
        u.display_name.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-page-heading text-white mb-2">Users</h1>
            <p className="text-gray-400">{users.length} registered users</p>
          </motion.div>

          {/* Search */}
          <div className="relative max-w-md mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="search-input"
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-[#2A2A2A] rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-[#2A2A2A] rounded" />
                      <div className="h-3 w-20 bg-[#2A2A2A] rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#222] bg-[#0A0A0A]">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">User</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Followers</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Votes</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Joined</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                    {filtered.map((u, i) => {
                      const isSelf = u._id === user._id;
                      return (
                        <motion.tr
                          key={u._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="hover:bg-[#1A1A1A]/50 transition-colors"
                        >
                          <td className="px-5 py-3">
                            <Link to={`/profile/${u.handle}`} className="flex items-center gap-3 group">
                              <img src={u.avatar_url} alt="" className="h-9 w-9 rounded-full border border-[#333]" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-white group-hover:text-gray-300 transition-colors">{u.display_name}</span>
                                  {u.is_admin && <Shield size={12} className="text-orange-400" />}
                                  {isSelf && <span className="text-[10px] text-blue-400 bg-blue-900/20 px-1.5 py-0.5 rounded">You</span>}
                                </div>
                                <p className="text-xs text-gray-500">@{u.handle}</p>
                              </div>
                            </Link>
                          </td>
                          <td className="px-5 py-3">
                            {u.current_category ? (
                              <Link
                                to={`/category/${u.current_category.slug}`}
                                className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
                              >
                                <Icon name={u.current_category.icon} size={12} />
                                <span>{u.current_category.name}</span>
                                {u.current_category.rank && (
                                  <span className="text-yellow-500 font-medium">#{u.current_category.rank}</span>
                                )}
                              </Link>
                            ) : (
                              <span className="text-xs text-gray-600">None</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-center text-xs text-gray-400">{u.followers_count.toLocaleString()}</td>
                          <td className="px-5 py-3 text-center text-xs text-gray-400">{u.total_votes_received}</td>
                          <td className="px-5 py-3 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={`https://x.com/${u.handle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-[#1A1A1A] transition-colors"
                                title="View on X"
                              >
                                <ExternalLink size={14} />
                              </a>
                              {!isSelf && !u.is_admin && (
                                <button
                                  onClick={() => handleDelete(u._id, u.handle)}
                                  disabled={deleting === u._id}
                                  className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/10 transition-colors disabled:opacity-50"
                                  title="Delete user"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
