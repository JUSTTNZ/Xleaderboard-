import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import BadgeCard from '../components/BadgeCard';
import { Award, Search, Filter } from 'lucide-react';

interface Badge {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  tier: string;
  category: string;
  points: number;
  is_secret: boolean;
  awarded_count: number;
  earned?: boolean;
  earned_at?: string;
}

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const { data } = await api.get('/badges');
      if (data.success) {
        setBadges(data.badges);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBadges = badges.filter(badge => {
    if (filter !== 'all' && badge.tier !== filter) return false;
    if (search && !badge.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const earnedCount = badges.filter(b => b.earned).length;
  const totalCount = badges.length;
  const progress = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  const tiers = ['all', 'legendary', 'epic', 'rare', 'uncommon', 'common'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Award className="w-12 h-12 text-yellow-400" />
          <h1 className="text-5xl font-bold">Badges</h1>
        </div>
        <p className="text-xl text-gray-400 mb-8">
          Earn badges by achieving milestones on RankX
        </p>

        {/* Progress */}
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Progress</span>
            <span className="font-semibold">
              {earnedCount} / {totalCount} ({progress.toFixed(1)}%)
            </span>
          </div>
          <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-yellow-600 to-orange-600"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search badges..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1A1A1A] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {tiers.map(tier => (
            <button
              key={tier}
              onClick={() => setFilter(tier)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors capitalize text-sm
                ${filter === tier 
                  ? 'bg-white text-black' 
                  : 'border border-gray-700 hover:bg-[#1A1A1A] text-gray-300 hover:text-white'
                }
              `}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Badge Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-40 bg-[#1A1A1A] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBadges.map((badge, index) => (
            <motion.div
              key={badge._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <BadgeCard badge={badge} />
            </motion.div>
          ))}
        </div>
      )}

      {filteredBadges.length === 0 && !loading && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No badges found</p>
        </div>
      )}
    </div>
  );
}
