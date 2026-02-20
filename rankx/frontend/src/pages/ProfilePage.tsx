import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, Trophy, BarChart3, FolderOpen, TrendingUp, TrendingDown, Minus, Award, Share2, Check, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import Icon from '../components/Icon';
import Tabs from '../components/Tabs';
import { ProfileSkeleton } from '../components/LoadingSkeleton';
import Footer from '../components/Footer';
import type { ProfileData } from '../types';

interface StatItem {
  icon: LucideIcon;
  label: string;
  value: string | number;
}

const profileTabs = [
  { id: 'rankings', label: 'Rankings' },
  { id: 'badges', label: 'Badges' },
];

export default function ProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rankings');
  const [copied, setCopied] = useState(false);

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

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1A1A1A] border border-[#333]">
          <Trophy size={28} className="text-gray-600" />
        </div>
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
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        {/* Cover Banner */}
        <div className="relative h-40 sm:h-52 bg-gradient-to-br from-[#1A1A1A] via-[#111] to-[#0A0A0A] overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.03),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(255,255,255,0.02),transparent)]" />
          <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Profile Header - overlapping banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative -mt-20 mb-10"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
              {/* Avatar */}
              <motion.img
                whileHover={{ scale: 1.03 }}
                src={user.avatar_url}
                alt={user.display_name}
                className="h-32 w-32 sm:h-36 sm:w-36 rounded-2xl border-4 border-[#0A0A0A] ring-2 ring-[#333] shadow-2xl"
              />

              <div className="flex-1 pb-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-page-heading text-white">{user.display_name}</h1>
                    <p className="text-lg text-gray-400 mt-1">@{user.handle}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleShare}
                      className="btn-secondary py-2.5 px-4 text-sm"
                    >
                      {copied ? <Check size={16} /> : <Share2 size={16} />}
                      {copied ? 'Copied!' : 'Share Profile'}
                    </button>
                    <a
                      href={`https://x.com/${user.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary py-2.5 px-4 text-sm"
                    >
                      <ExternalLink size={16} />
                      View on X
                    </a>
                  </div>
                </div>
                {user.bio && (
                  <p className="mt-3 text-gray-400 max-w-2xl leading-relaxed">{user.bio}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {statItems.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-6 flex items-center gap-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A0A0A] border border-[#333]">
                  <stat.icon size={22} className="text-gray-500" />
                </div>
                <div>
                  <span className="text-3xl font-bold text-white">{stat.value}</span>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <Tabs tabs={profileTabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          {/* Tab Content */}
          {activeTab === 'rankings' && (
            <>
              {rankings.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-12"
                >
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
                              className="hover:bg-[#1A1A1A]/50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <Link
                                  to={`/category/${r.category.slug}`}
                                  className="flex items-center gap-3 text-white hover:text-gray-300 transition-colors group"
                                >
                                  <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-[#2A2A2A] group-hover:bg-[#3A3A3A] transition-colors">
                                    <Icon name={r.category.icon} size={16} className="text-gray-400" />
                                  </div>
                                  <span className="font-medium">{r.category.name}</span>
                                </Link>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center justify-center h-8 w-12 rounded-lg font-bold text-sm ${
                                  r.rank === 1 ? 'bg-yellow-500/10 text-yellow-500' :
                                  r.rank === 2 ? 'bg-gray-400/10 text-gray-400' :
                                  r.rank === 3 ? 'bg-orange-500/10 text-orange-500' :
                                  'text-white'
                                }`}>
                                  {r.rank ? `#${r.rank}` : '-'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center text-gray-400 text-sm">
                                {r.vote_count}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {r.rank_change > 0 ? (
                                  <span className="inline-flex items-center gap-1 text-green-500 text-sm font-medium">
                                    <TrendingUp size={14} />
                                    +{r.rank_change}
                                  </span>
                                ) : r.rank_change < 0 ? (
                                  <span className="inline-flex items-center gap-1 text-red-500 text-sm font-medium">
                                    <TrendingDown size={14} />
                                    {r.rank_change}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-gray-500">
                                    <Minus size={14} />
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
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-16 text-center mb-12"
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A0A0A] border border-[#333]">
                    <Trophy size={28} className="text-gray-600" />
                  </div>
                  <p className="text-gray-400">No rankings yet.</p>
                  <p className="text-sm text-gray-500 mt-1">Apply to categories to get started!</p>
                </motion.div>
              )}
            </>
          )}

          {activeTab === 'badges' && (
            <>
              {badges.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-12"
                >
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {badges.map((badge, i) => (
                      <motion.div
                        key={badge.name}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.03, y: -2 }}
                        className="card p-6 flex flex-col items-center text-center"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A0A0A] border border-[#333] mb-4">
                          <Award size={24} className="text-white" />
                        </div>
                        <p className="text-sm font-semibold text-white mb-1">{badge.name}</p>
                        <p className="text-xs text-gray-500">{badge.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-16 text-center mb-12"
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A0A0A] border border-[#333]">
                    <Award size={28} className="text-gray-600" />
                  </div>
                  <p className="text-gray-400">No badges earned yet.</p>
                  <p className="text-sm text-gray-500 mt-1">Badges are earned through activity and achievements.</p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
