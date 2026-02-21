import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, X, Check, Edit2, Power, PowerOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/Toast';
import AdminSidebar from '../../components/AdminSidebar';
import Icon from '../../components/Icon';
import type { AdminCategory } from '../../types';

export default function AdminCategoriesPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', icon: 'Trophy' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.is_admin) return;
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/admin/categories');
      setCategories(data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post('/admin/categories', form);
      setCategories((prev) => [...prev, data.category]);
      setShowCreate(false);
      setForm({ name: '', description: '', icon: 'Trophy' });
      toast('success', 'Category created');
    } catch (error: any) {
      toast('error', error?.response?.data?.error || 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    try {
      const { data } = await api.put(`/admin/categories/${id}`, form);
      setCategories((prev) => prev.map((c) => (c._id === id ? data.category : c)));
      setEditingId(null);
      toast('success', 'Category updated');
    } catch (error: any) {
      toast('error', error?.response?.data?.error || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      await api.put(`/admin/categories/${id}`, { is_active: !currentActive });
      setCategories((prev) =>
        prev.map((c) => (c._id === id ? { ...c, is_active: !currentActive } : c))
      );
      toast('success', currentActive ? 'Category deactivated' : 'Category activated');
    } catch {
      toast('error', 'Failed to toggle category');
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
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <h1 className="text-page-heading text-white mb-2">Categories</h1>
              <p className="text-gray-400">Create and manage categories</p>
            </div>
            <button
              onClick={() => { setShowCreate(true); setForm({ name: '', description: '', icon: 'Trophy' }); }}
              className="btn-primary py-2.5 px-4 text-sm"
            >
              <Plus size={16} />
              New Category
            </button>
          </motion.div>

          {/* Create modal */}
          <AnimatePresence>
            {showCreate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="card p-6 mb-6 overflow-hidden"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Create Category</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Category name"
                    className="input-base"
                  />
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Description"
                    rows={2}
                    className="input-base resize-none"
                  />
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                    placeholder="Lucide icon name (e.g. Trophy, Code, Rocket)"
                    className="input-base"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setShowCreate(false)} className="btn-secondary py-2 px-4 text-sm flex-1 justify-center">Cancel</button>
                    <button onClick={handleCreate} disabled={saving} className="btn-primary py-2 px-4 text-sm flex-1 justify-center disabled:opacity-50">
                      {saving ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Categories list */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-[#2A2A2A] rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-40 bg-[#2A2A2A] rounded" />
                      <div className="h-3 w-64 bg-[#2A2A2A] rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`card p-5 ${!cat.is_active ? 'opacity-50' : ''}`}
                >
                  {editingId === cat._id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className="input-base"
                      />
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        rows={2}
                        className="input-base resize-none"
                      />
                      <input
                        type="text"
                        value={form.icon}
                        onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                        className="input-base"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => setEditingId(null)} className="btn-secondary py-1.5 px-3 text-xs">Cancel</button>
                        <button onClick={() => handleUpdate(cat._id)} disabled={saving} className="btn-primary py-1.5 px-3 text-xs disabled:opacity-50">
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#0A0A0A] border border-[#333] flex-shrink-0">
                          <Icon name={cat.icon} size={18} className="text-gray-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{cat.name}</p>
                          <p className="text-xs text-gray-500 truncate">{cat.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-shrink-0">
                        <span>{cat.member_count} members</span>
                        <span>{cat.total_votes} votes</span>
                        <span className={cat.is_active ? 'text-green-500' : 'text-red-500'}>
                          {cat.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditingId(cat._id);
                            setForm({ name: cat.name, description: cat.description, icon: cat.icon });
                          }}
                          className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-[#1A1A1A] transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => toggleActive(cat._id, cat.is_active)}
                          className={`p-2 rounded-lg transition-colors ${
                            cat.is_active
                              ? 'text-gray-500 hover:text-red-400 hover:bg-red-900/10'
                              : 'text-gray-500 hover:text-green-400 hover:bg-green-900/10'
                          }`}
                          title={cat.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {cat.is_active ? <PowerOff size={14} /> : <Power size={14} />}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
