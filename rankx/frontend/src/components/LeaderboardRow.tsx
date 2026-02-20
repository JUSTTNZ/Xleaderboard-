import { Link } from 'react-router-dom';
import { Trophy, Medal, ThumbsUp, Check, Ban } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LeaderboardMember } from '../types';

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex h-10 w-10 items-center justify-center">
        <Trophy size={20} className="text-yellow-500" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex h-10 w-10 items-center justify-center">
        <Medal size={20} className="text-gray-400" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex h-10 w-10 items-center justify-center">
        <Medal size={20} className="text-orange-600" />
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center text-sm font-bold text-gray-500">
      {rank}
    </div>
  );
}

interface LeaderboardRowProps {
  member: LeaderboardMember;
  currentUserId: string | undefined;
  onVote: (userId: string) => void;
  index: number;
}

export default function LeaderboardRow({
  member,
  currentUserId,
  onVote,
  index,
}: LeaderboardRowProps) {
  const isSelf = currentUserId && member.user._id === currentUserId;
  const isVoted = member.is_voted;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className={`transition-colors hover:bg-[#1A1A1A] ${
        isSelf ? 'bg-[#1A1A1A]/50' : ''
      }`}
    >
      {/* Rank */}
      <td className="px-6 py-4">
        <RankBadge rank={member.rank} />
      </td>

      {/* Creator Profile */}
      <td className="px-6 py-4">
        <Link
          to={`/profile/${member.user.handle}`}
          className="flex items-center gap-3 group"
        >
          <img
            src={member.user.avatar_url}
            alt={member.user.display_name}
            className="h-12 w-12 rounded-full border-2 border-[#333] group-hover:border-[#555] transition-colors"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white truncate group-hover:text-gray-300 transition-colors">
                {member.user.display_name}
              </span>
              {isSelf && (
                <span className="inline-block bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0">
                  YOU
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500 block truncate">
              @{member.user.handle}
            </span>
          </div>
        </Link>
      </td>

      {/* Vote Count */}
      <td className="px-6 py-4 text-center">
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="font-bold text-white text-lg">{member.vote_count}</span>
          <ThumbsUp size={16} className="text-gray-500" />
        </div>
      </td>

      {/* Vote Button */}
      <td className="px-6 py-4 text-right">
        {isSelf ? (
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <Ban size={14} />
            Can't vote for yourself
          </span>
        ) : isVoted ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onVote(member.user._id)}
            className="inline-flex items-center gap-1.5 bg-green-900/30 text-green-400 border border-green-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-green-900/40"
            title="Click to remove your vote"
          >
            <Check size={16} />
            Voted
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onVote(member.user._id)}
            className="inline-flex items-center gap-2 border border-[#333] bg-[#1A1A1A] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:border-[#555] hover:bg-[#2A2A2A]"
            title="Vote for this creator"
          >
            <ThumbsUp size={16} />
            Vote
          </motion.button>
        )}
      </td>
    </motion.tr>
  );
}
