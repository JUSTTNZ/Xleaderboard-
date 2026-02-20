import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, BarChart3, ArrowLeft, UserPlus, X, Trophy, Medal, Crown, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import Icon from '../components/Icon';
import LeaderboardRow from '../components/LeaderboardRow';
import { LeaderboardSkeleton } from '../components/LoadingSkeleton';
import type { Category, LeaderboardMember } from '../types';

function PodiumCard({ member, rank, onVote, currentUserId }: { member: LeaderboardMember; rank: number; onVote: (id: string) => void; currentUserId?: string }) {
  const podiumClass = rank === 1 ? 'podium-gold' : rank === 2 ? 'podium-silver' : 'podium-bronze';
  const isSelf = currentUserId && member.user._id === currentUserId;
  const borderSize = rank === 1 ? 'border-4' : 'border-2';
  const avatarSize = rank === 1 ? 'h-20 w-20' : 'h-16 w-16';
  const rankColor = rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : 'text-orange-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1, duration: 0.5 }}
      className={`rounded-2xl border p-6 flex flex-col items-center text-center transition-all duration-300 ${podiumClass} ${rank === 1 ? 'sm:-mt-4 sm:scale-105' : ''}`}
    >
      {/* Crown for #1 */}
      {rank === 1 && <Crown size={28} className="text-yellow-500 mb-2" />}
      {rank === 2 && <Medal size={22} className="text-gray-400 mb-2" />}
      {rank === 3 && <Medal size={22} className="text-orange-500 mb-2" />}

      {/* Avatar */}
      <Link to={`/profile/${member.user.handle}`}>
        <img
          src={member.user.avatar_url}
          alt={member.user.display_name}
          className={`${avatarSize} rounded-full ${borderSize} mb-3 hover:scale-105 transition-transform ${
            rank === 1 ? 'border-yellow-500/40' : rank === 2 ? 'border-gray-400/40' : 'border-orange-500/40'
          }`}
        />
      </Link>

      {/* Name */}
      <Link to={`/profile/${member.user.handle}`} className="hover:opacity-80 transition-opacity">
        <p className="font-semibold text-white text-sm truncate max-w-[140px]">{member.user.display_name}</p>
        <p className="text-xs text-gray-500 truncate max-w-[140px]">@{member.user.handle}</p>
      </Link>

      {/* Vote count */}
      <div className="mt-3 flex items-center gap-1.5">
        <span className={`text-2xl font-bold ${rankColor}`}>{member.vote_count}</span>
        <ThumbsUp size={14} className="text-gray-500" />
      </div>

      {/* Vote button */}
      {!isSelf && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onVote(member.user._id)}
          className={`mt-3 w-full py-2 rounded-lg text-xs font-medium transition-all ${
            member.is_voted
              ? 'bg-green-900/30 text-green-400 border border-green-800'
              : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
          }`}
        >
          {member.is_voted ? 'Voted' : 'Vote'}
        </motion.button>
      )}
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, signInWithTwitter } = useAuth();
  const { toast } = useToast();
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

      const votedMember = members.find((m) => m.user._id === votedForId);
      if (data.action === 'unvoted') {
        toast('info', `Vote removed`);
      } else {
        toast('success', `Voted for ${votedMember?.user.display_name || 'user'}`);
      }
    } catch (error) {
      console.error('Vote failed:', error);
      toast('error', 'Failed to vote. Please try again.');
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
      toast('success', 'Application submitted! We\'ll review it soon.');
    } catch (error) {
      console.error('Apply failed:', error);
      toast('error', 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-6 w-24 bg-[#2A2A2A] rounded mb-6" />
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 bg-[#2A2A2A] rounded-xl" />
            <div className="space-y-3">
              <div className="h-10 w-48 bg-[#2A2A2A] rounded" />
              <div className="h-4 w-32 bg-[#2A2A2A] rounded" />
            </div>
          </div>
        </div>
        <LeaderboardSkeleton />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1A1A1A] border border-[#333]">
          <Trophy size={28} className="text-gray-600" />
        </div>
        <p className="text-gray-400">Category not found.</p>
        <button
          onClick={() => navigate('/categories')}
          className="text-sm text-gray-500 hover:text-white transition-colors underline"
        >
          Back to categories
        </button>
      </div>
    );
  }

  const top3 = members.slice(0, 3);
  const rest = members.slice(3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/categories')}
        className="mb-8 flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
      >
        <ArrowLeft size={16} />
        All Categories
      </motion.button>

      {/* Category Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"
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
              <span className="flex items-center gap-1.5 bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-1.5">
                <Users size={14} />
                {category.member_count} members
              </span>
              <span className="flex items-center gap-1.5 bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-1.5">
                <BarChart3 size={14} />
                {category.total_votes.toLocaleString()} votes
              </span>
            </div>
            {category.description && (
              <p className="mt-3 max-w-2xl text-sm text-gray-400 leading-relaxed">
                {category.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
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
            <div className="inline-flex items-center gap-2 rounded-lg bg-orange-900/30 border border-orange-800 px-6 py-3 text-sm font-medium text-orange-400">
              <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
              Application Pending
            </div>
          )}

          {userMembership === 'approved' && (
            <div className="inline-flex items-center gap-2 rounded-lg bg-green-900/30 border border-green-800 px-6 py-3 text-sm font-medium text-green-400">
              <div className="h-2 w-2 rounded-full bg-green-400" />
              Member
            </div>
          )}
        </div>
      </motion.div>

      {/* Top 3 Podium */}
      {top3.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="grid gap-4 grid-cols-3 max-w-2xl mx-auto">
            {/* 2nd place */}
            <PodiumCard member={top3[1]} rank={2} onVote={handleVote} currentUserId={user?._id} />
            {/* 1st place */}
            <PodiumCard member={top3[0]} rank={1} onVote={handleVote} currentUserId={user?._id} />
            {/* 3rd place */}
            <PodiumCard member={top3[2]} rank={3} onVote={handleVote} currentUserId={user?._id} />
          </div>
        </motion.div>
      )}

      {/* Leaderboard Table */}
      {members.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
                {(top3.length >= 3 ? rest : members).map((member, index) => (
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
          {top3.length >= 3 && rest.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-500">
              Only 3 members in this category so far.
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card rounded-xl py-20 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A0A0A] border border-[#333]">
            <Users size={28} className="text-gray-600" />
          </div>
          <p className="text-body text-gray-400">No members yet. Be the first to apply!</p>
        </motion.div>
      )}

      {/* Apply Modal */}
      <AnimatePresence>
        {applyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6"
            onClick={() => { setApplyModal(false); setApplyReason(''); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-md card p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-card-heading font-bold text-white">
                  Apply to {category.name}
                </h2>
                <button
                  onClick={() => { setApplyModal(false); setApplyReason(''); }}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-[#2A2A2A] hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm mb-6 text-gray-400">
                Tell us why you belong in this category (20-200 characters).
              </p>

              <textarea
                value={applyReason}
                onChange={(e) => setApplyReason(e.target.value)}
                placeholder="Why do you belong in this category?"
                maxLength={200}
                rows={4}
                className="input-base focus-ring mb-3 resize-none"
              />

              <div className="flex items-center justify-between mb-5">
                <p className="text-xs text-gray-500">
                  {applyReason.length}/200 characters
                </p>
                {applyReason.length > 0 && applyReason.length < 20 && (
                  <p className="text-xs text-orange-400">Minimum 20 characters</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setApplyModal(false); setApplyReason(''); }}
                  className="btn-secondary flex-1 py-2.5 justify-center"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={applyReason.length < 20 || applyReason.length > 200 || applying}
                  className="btn-primary flex-1 py-2.5 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
