export interface User {
  _id: string;
  supabase_id: string;
  twitter_id: string;
  handle: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  followers_count: number;
  total_votes_received: number;
  last_login: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  member_count: number;
  total_votes: number;
  is_active: boolean;
  top_members?: TopMember[];
}

export interface TopMember {
  handle: string;
  display_name: string;
  avatar_url: string;
}

export interface LeaderboardMember {
  rank: number;
  user: {
    _id: string;
    handle: string;
    display_name: string;
    avatar_url: string;
    bio: string;
    followers_count: number;
  };
  vote_count: number;
  rank_change: number;
  is_voted: boolean;
  is_self: boolean;
}

export interface Ranking {
  category: {
    name: string;
    slug: string;
    icon: string;
    color?: string;
  };
  rank: number | null;
  vote_count: number;
  rank_change: number;
}

export interface VoteCast {
  category: {
    name: string;
    slug: string;
    icon: string;
  };
  voted_for: {
    handle: string;
    display_name: string;
    avatar_url: string;
  };
}

export interface PendingApplication {
  category: {
    name: string;
    slug: string;
    icon: string;
  };
  applied_at: string;
  reason: string;
}

export interface Badge {
  name: string;
  description: string;
  icon: string;
  color?: string;
  earned_at: string;
}

export interface ProfileData {
  user: {
    _id: string;
    handle: string;
    display_name: string;
    avatar_url: string;
    bio: string;
    is_verified?: boolean;
    followers_count: number;
    following_count?: number;
  };
  stats: {
    total_votes: number;
    categories_count: number;
    highest_rank: number | null;
  };
  rankings: Ranking[];
  badges: Badge[];
}

export interface DashboardData {
  stats: {
    total_votes: number;
    categories_count: number;
    highest_rank: number | null;
    votes_cast: number;
  };
  rankings: Ranking[];
  votes: VoteCast[];
  pending_applications: PendingApplication[];
}
