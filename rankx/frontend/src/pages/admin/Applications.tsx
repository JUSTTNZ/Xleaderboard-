import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Check, X, Shield, ExternalLink, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/Toast';
import AdminSidebar from '../../components/AdminSidebar';
import Icon from '../../components/Icon';
import Tabs from '../../components/Tabs';
import type { AdminApplication } from '../../types';

const statusTabs = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

export default function AdminApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.is_admin) return;
    fetchApplications(statusFilter);
  }, [user, statusFilter]);

  const fetchApplications = async (status: string) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/applications?status=${status}`);
      setApplications(data.applications);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessing(id);
    try {
      await api.post(`/admin/applications/${id}/${action}`);
      toast('success', `Application ${action}d`);
      setApplications((prev) => prev.filter((a) => a._id !== id));
    } catch (error: any) {
      const msg = error?.response?.data?.error || `Failed to ${action}`;
      toast('error', msg);
    } finally {
      setProcessing(null);
    }
  };

  if (authLoading) return null;
  if (!user?.is_admin) return <Navigate to="/" replace />;

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
            <h1 className="text-page-heading text-white mb-2">Applications</h1>
            <p className="text-gray-400">Review and manage category applications</p>
          </motion.div>

          <div className="mb-6">
            <Tabs tabs={statusTabs} activeTab={statusFilter} onChange={setStatusFilter} />
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-[#2A2A2A] rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-[#2A2A2A] rounded" />
                      <div className="h-3 w-48 bg-[#2A2A2A] rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="card p-16 text-center">
              <Clock size={36} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">No {statusFilter} applications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app, i) => {
                const isOwnApp = app.user._id === user._id;
                return (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`card p-5 ${isOwnApp ? 'border-blue-800/40' : ''}`}
                  >
                    {isOwnApp && (
                      <div className="flex items-center gap-2 mb-3 text-xs font-medium text-blue-400">
                        <Shield size={12} />
                        Your Application
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* User info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Link to={`/profile/${app.user.handle}`}>
                          <img
                            src={app.user.avatar_url}
                            alt={app.user.display_name}
                            className="h-12 w-12 rounded-full border-2 border-[#333] flex-shrink-0"
                          />
                        </Link>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Link to={`/profile/${app.user.handle}`} className="text-sm font-semibold text-white hover:text-gray-300 transition-colors truncate">
                              {app.user.display_name}
                            </Link>
                            {app.user.is_admin && (
                              <span className="text-[10px] font-medium text-orange-400 bg-orange-900/20 px-1.5 py-0.5 rounded">Admin</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">@{app.user.handle} · {app.user.followers_count.toLocaleString()} followers</p>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#0A0A0A] border border-[#333]">
                          <Icon name={app.category.icon} size={14} className="text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-300">{app.category.name}</span>
                      </div>

                      {/* Actions */}
                      {statusFilter === 'pending' && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleAction(app._id, 'approve')}
                            disabled={processing === app._id}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-green-900/30 text-green-400 border border-green-800 hover:bg-green-900/40 transition-colors disabled:opacity-50"
                          >
                            <Check size={14} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(app._id, 'reject')}
                            disabled={processing === app._id}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-red-900/30 text-red-400 border border-red-800 hover:bg-red-900/40 transition-colors disabled:opacity-50"
                          >
                            <X size={14} />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Reason */}
                    {app.reason && (
                      <p className="mt-3 text-xs text-gray-500 bg-[#0A0A0A] border border-[#222] rounded-lg px-3 py-2">
                        "{app.reason}"
                      </p>
                    )}

                    <p className="mt-2 text-[10px] text-gray-600">
                      Applied {new Date(app.applied_at).toLocaleDateString()} at {new Date(app.applied_at).toLocaleTimeString()}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
