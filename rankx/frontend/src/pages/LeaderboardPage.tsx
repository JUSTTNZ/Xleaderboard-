import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Users, BarChart3, ArrowLeft, UserPlus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import Icon from '../components/Icon';
import LeaderboardRow from '../components/LeaderboardRow';
import type { Category, LeaderboardMember } from '../types';

export default function LeaderboardPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, signInWithTwitter } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [members, setMembers] = useState<LeaderboardMember[]>([]);
  const [userMembership, setUserMembership] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyModal, setApplyModal] = useState(false);
  const [applyReason, setApplyReason] = useState('');
  const [applying, setApplying] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const { data } = await api.get(`/categories/${slug}`);
      setCategory(data.category);
      setMembers(data.members);
      setUserMembership(data.user_membership);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleVote = async (votedForId: string) => {
    if (!user) {
      signInWithTwitter();
      return;
    }
    if (!category) return;

    try {
      const { data } = await api.post('/votes', {
        category_id: category._id,
        voted_for_id: votedForId,
      });

      setMembers((prev) => {
        const updated = prev.map((m) => {
          if (m.user._id === votedForId) {
            const wasVoted = m.is_voted;
            return {
              ...m,
              vote_count: wasVoted ? m.vote_count - 1 : m.vote_count + 1,
              is_voted: !wasVoted,
            };
          }
          if (m.is_voted && data.action === 'voted') {
            return { ...m, is_voted: false };
          }
          if (m.is_voted && data.action === 'changed') {
            return { ...m, vote_count: m.vote_count - 1, is_voted: false };
          }
          return m;
        });
        return updated.sort((a, b) => b.vote_count - a.vote_count);
      });
    } catch (error) {
      console.error('Vote failed:', error);
      fetchData();
    }
  };

  const handleApply = async () => {
    if (!user) {
      signInWithTwitter();
      return;
    }

    setApplying(true);
    try {
      await api.post(`/categories/${slug}/apply`, { reason: applyReason });
      setUserMembership('pending');
      setApplyModal(false);
      setApplyReason('');
    } catch (error) {
      console.error('Apply failed:', error);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Category not found.</p>
        <button
          onClick={() => navigate('/categories')}
          className="text-sm text-white underline hover:text-gray-300"
        >
          Back to categories
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/categories')}
        className="mb-8 flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
      >
        <ArrowLeft size={16} />
        All Categories
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="flex items-start gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex h-16 w-16 items-center justify-center rounded-xl border border-[#333] bg-[#1A1A1A]"
          >
            <Icon name={category.icon} size={32} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-page-heading text-white">{category.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Users size={16} />
                {category.member_count} members
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 size={16} />
                {category.total_votes.toLocaleString()} votes
              </span>
            </div>
            {category.description && (
              <p className="mt-3 max-w-2xl text-body-small text-gray-400">
                {category.description}
              </p>
            )}
          </div>
        </div>

        <div>
          {user && !userMembership && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setApplyModal(true)}
              className="btn-primary py-3 px-6"
            >
              <UserPlus size={18} />
              Apply to Join
            </motion.button>
          )}

          {userMembership === 'pending' && (
            <div className="inline-block rounded-lg bg-orange-900/30 border border-orange-800 px-6 py-3 text-sm font-medium text-orange-400">
              ⏳ Application Pending
            </div>
          )}

          {userMembership === 'approved' && (
            <div className="inline-block rounded-lg bg-green-900/30 border border-green-800 px-6 py-3 text-sm font-medium text-green-400">
              ✓ Member
            </div>
          )}
        </div>
      </motion.div>

      {members.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#222] bg-[#0A0A0A]">
                  <th className="w-12 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Creator</th>
                  <th className="w-20 px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Votes</th>
                  <th className="w-32 px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Vote</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {members.map((member, index) => (
                  <LeaderboardRow
                    key={member.user._id}
                    member={member}
                    currentUserId={user?._id}
                    onVote={handleVote}
                    index={index}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card rounded-xl py-20 text-center"
        >
          <Users size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-body text-gray-400">No members yet. Be the first to apply!</p>
        </motion.div>
      )}

      {/* Apply Modal */}
      {applyModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md card p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-card-heading font-bold text-white">
                Apply to {category.name}
              </h2>
              <button
                onClick={() => {
                  setApplyModal(false);
                  setApplyReason('');
                }}
                className="p-1 rounded-lg text-gray-400 hover:bg-[#1A1A1A] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-body-small mb-6 text-gray-400">
              Tell us why you belong in this category (20-200 characters).
            </p>

            <textarea
              value={applyReason}
              onChange={(e) => setApplyReason(e.target.value)}
              placeholder="Why do you belong in this category?"
              maxLength={200}
              rows={4}
              className="input-base focus-ring mb-4 resize-none"
            />

            <p className="text-caption text-gray-500 mb-4">
              {applyReason.length}/200 characters
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setApplyModal(false);
                  setApplyReason('');
                }}
                className="btn-secondary flex-1 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applyReason.length < 20 || applyReason.length > 200 || applying}
                className="btn-primary flex-1 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applying ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
