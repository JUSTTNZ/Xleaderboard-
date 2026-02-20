import { useState, useEffect, useMemo } from 'react';
import { Search, Grid3X3, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import CategoryCard from '../components/CategoryCard';
import { CategoriesGridSkeleton } from '../components/LoadingSkeleton';
import Footer from '../components/Footer';
import type { Category } from '../types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'members' | 'votes'>('members');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.categories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filtered = useMemo(() => {
    let result = categories;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'members') return b.member_count - a.member_count;
      return b.total_votes - a.total_votes;
    });
    return result;
  }, [categories, search, sortBy]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A1A1A] border border-[#333]">
              <Grid3X3 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-page-heading text-white">Categories</h1>
            </div>
          </div>
          <p className="text-lg text-gray-400 mt-2 max-w-2xl">
            Browse all categories and vote for the best creators in each one.
          </p>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="search-input"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-gray-500" />
            <span className="text-xs text-gray-500 mr-2">Sort by:</span>
            {(['members', 'votes', 'name'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                  sortBy === s
                    ? 'bg-[#2A2A2A] text-white border border-[#444]'
                    : 'text-gray-500 hover:text-white border border-transparent'
                }`}
              >
                {s === 'members' ? 'Most Members' : s === 'votes' ? 'Most Votes' : 'A-Z'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <CategoriesGridSkeleton />
        ) : filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((category, i) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <CategoryCard category={category} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1A1A1A] border border-[#333]">
              <Search size={28} className="text-gray-600" />
            </div>
            <p className="text-gray-400 mb-2">No categories found</p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-sm text-gray-500 hover:text-white transition-colors underline"
              >
                Clear search
              </button>
            )}
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
