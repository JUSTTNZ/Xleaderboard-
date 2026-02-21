import Badge, { UserBadge } from '../models/Badge';
import User from '../models/User';
import CategoryMember from '../models/CategoryMember';
import Vote from '../models/Vote';
import { IBadge, IUserBadge } from '../types';
import { Types } from 'mongoose';

export class BadgeService {
  
  // Award badge to user
  static async awardBadge(userId: string | Types.ObjectId, badgeSlug: string): Promise<IUserBadge | null> {
    try {
      const badge = await Badge.findOne({ slug: badgeSlug });
      if (!badge) {
        console.log(`Badge ${badgeSlug} not found`);
        return null;
      }

      const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

      // Check if already awarded
      const existing = await UserBadge.findOne({
        user: userObjectId,
        badge: badge._id
      });

      if (existing) {
        console.log(`User already has badge: ${badge.name}`);
        return null;
      }

      // Create user badge
      const userBadge = new UserBadge({
        user: userObjectId,
        badge: badge._id,
        progress: 100
      });

      await userBadge.save();

      // Increment awarded count
      await Badge.findByIdAndUpdate(badge._id, {
        $inc: { awarded_count: 1 }
      });

      console.log(`✅ Awarded badge "${badge.name}" to user ${userId}`);
      return userBadge;
    } catch (error) {
      console.error('Award badge error:', error);
      return null;
    }
  }

  // Check and award ranking badges
  static async checkRankingBadges(userId: string | Types.ObjectId, categoryId: string | Types.ObjectId): Promise<void> {
    const categoryObjectId = typeof categoryId === 'string' ? new Types.ObjectId(categoryId) : categoryId;
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    const member = await CategoryMember.findOne({
      user: userObjectId,
      category: categoryObjectId,
      status: 'approved'
    });

    if (!member || member.current_rank === null) return;

    const rank = member.current_rank;

    // Category King / Gold Medalist (#1)
    if (rank === 1) {
      await this.awardBadge(userId, 'category-king');
      await this.awardBadge(userId, 'gold-medalist');
    }

    // Silver Medalist (#2)
    if (rank === 2) {
      await this.awardBadge(userId, 'silver-medalist');
    }

    // Bronze Medalist (#3)
    if (rank === 3) {
      await this.awardBadge(userId, 'bronze-medalist');
    }

    // Elite Ranker (top 5)
    if (rank <= 5) {
      await this.awardBadge(userId, 'elite-ranker');
    }

    // Top 10 Club
    if (rank <= 10) {
      await this.awardBadge(userId, 'top-10-club');
    }

    // On The Board (first time appearing)
    await this.awardBadge(userId, 'on-the-board');
  }

  // Check and award vote badges
  static async checkVoteBadges(userId: string | Types.ObjectId): Promise<void> {
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    
    const user = await User.findById(userObjectId);
    if (!user) return;

    const totalVotes = user.total_votes_received;

    // Vote milestones
    if (totalVotes >= 10000) {
      await this.awardBadge(userId, 'ten-thousand-legend');
    } else if (totalVotes >= 5000) {
      await this.awardBadge(userId, 'five-thousand-club');
    } else if (totalVotes >= 1000) {
      await this.awardBadge(userId, 'thousand-fans');
    } else if (totalVotes >= 500) {
      await this.awardBadge(userId, 'half-thousand');
    } else if (totalVotes >= 100) {
      await this.awardBadge(userId, 'century-club');
    } else if (totalVotes >= 50) {
      await this.awardBadge(userId, 'popular');
    } else if (totalVotes >= 25) {
      await this.awardBadge(userId, 'well-known');
    } else if (totalVotes >= 10) {
      await this.awardBadge(userId, 'appreciated');
    } else if (totalVotes >= 1) {
      await this.awardBadge(userId, 'first-supporter');
    }

    // Check unique voters
    const uniqueVoters = await Vote.distinct('voter', {
      voted_for: userObjectId
    });

    if (uniqueVoters.length >= 100) {
      await this.awardBadge(userId, 'universally-acclaimed');
    } else if (uniqueVoters.length >= 50) {
      await this.awardBadge(userId, 'crowd-favorite');
    } else if (uniqueVoters.length >= 25) {
      await this.awardBadge(userId, 'widely-supported');
    } else if (uniqueVoters.length >= 10) {
      await this.awardBadge(userId, 'community-loved');
    }
  }

  // Check and award engagement badges
  static async checkEngagementBadges(userId: string | Types.ObjectId): Promise<void> {
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    // Votes cast
    const votesCast = await Vote.countDocuments({ voter: userObjectId });

    if (votesCast >= 100) {
      await this.awardBadge(userId, 'elite-voter');
    } else if (votesCast >= 50) {
      await this.awardBadge(userId, 'super-voter');
    } else if (votesCast >= 25) {
      await this.awardBadge(userId, 'active-voter');
    } else if (votesCast >= 10) {
      await this.awardBadge(userId, 'voter');
    } else if (votesCast >= 1) {
      await this.awardBadge(userId, 'first-vote');
    }

    // Unique people voted for
    const uniqueVotesFor = await Vote.distinct('voted_for', {
      voter: userObjectId
    });

    if (uniqueVotesFor.length >= 100) {
      await this.awardBadge(userId, 'network-king');
    } else if (uniqueVotesFor.length >= 50) {
      await this.awardBadge(userId, 'connector');
    } else if (uniqueVotesFor.length >= 25) {
      await this.awardBadge(userId, 'community-builder');
    } else if (uniqueVotesFor.length >= 10) {
      await this.awardBadge(userId, 'supporter');
    }

    // Account age
    const user = await User.findById(userObjectId);
    if (!user) return;
    
    const accountAge = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    if (accountAge >= 365) {
      await this.awardBadge(userId, 'one-year-king');
    } else if (accountAge >= 180) {
      await this.awardBadge(userId, 'half-year-legend');
    } else if (accountAge >= 90) {
      await this.awardBadge(userId, 'three-month-veteran');
    } else if (accountAge >= 30) {
      await this.awardBadge(userId, 'one-month-member');
    } else if (accountAge >= 7) {
      await this.awardBadge(userId, 'one-week-old');
    }
  }

  // Check and award social badges
  static async checkSocialBadges(userId: string | Types.ObjectId): Promise<void> {
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    
    const user = await User.findById(userObjectId);
    if (!user) return;

    const followers = user.followers_count;

    if (followers >= 100000) {
      await this.awardBadge(userId, 'mega-influencer');
    } else if (followers >= 10000) {
      await this.awardBadge(userId, 'twitter-star');
    } else if (followers >= 5000) {
      await this.awardBadge(userId, 'notable');
    } else if (followers >= 1000) {
      await this.awardBadge(userId, 'influencer');
    } else if (followers >= 500) {
      await this.awardBadge(userId, 'growing-account');
    } else if (followers >= 100) {
      await this.awardBadge(userId, 'twitter-newbie');
    }

    // Profile completeness
    if (user.bio) {
      await this.awardBadge(userId, 'bio-writer');
    }

    if (user.avatar_url) {
      await this.awardBadge(userId, 'profile-picture');
    }

    if (user.bio && user.avatar_url) {
      await this.awardBadge(userId, 'styled');
    }
  }

  // Check and award special badges
  static async checkSpecialBadges(userId: string | Types.ObjectId): Promise<void> {
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    
    const user = await User.findById(userObjectId);
    if (!user) return;

    // Admin badge
    if (user.is_admin) {
      await this.awardBadge(userId, 'admin');
    }

    // Launch day (Feb 21, 2026)
    const launchDate = new Date('2026-02-21');
    const joinDate = new Date(user.createdAt);
    
    if (joinDate.toDateString() === launchDate.toDateString()) {
      await this.awardBadge(userId, 'launch-day');
    }

    // Beta tester (before March 1, 2026)
    const betaEnd = new Date('2026-03-01');
    if (joinDate < betaEnd) {
      await this.awardBadge(userId, 'beta-tester');
    }
  }

  // Check first blood (first member in category)
  static async checkFirstBlood(userId: string | Types.ObjectId, categoryId: string | Types.ObjectId): Promise<void> {
    const categoryObjectId = typeof categoryId === 'string' ? new Types.ObjectId(categoryId) : categoryId;
    
    const memberCount = await CategoryMember.countDocuments({
      category: categoryObjectId,
      status: 'approved'
    });

    if (memberCount === 1) {
      // This is the first member
      await this.awardBadge(userId, 'first-blood');
    } else if (memberCount <= 10) {
      await this.awardBadge(userId, 'founding-member');
    } else if (memberCount <= 50) {
      await this.awardBadge(userId, 'early-adopter');
    }
  }

  // Check application badges
  static async checkApplicationBadges(userId: string | Types.ObjectId): Promise<void> {
    await this.awardBadge(userId, 'applicant');
  }

  // Check approval badges
  static async checkApprovalBadges(userId: string | Types.ObjectId, categoryId: string | Types.ObjectId): Promise<void> {
    await this.awardBadge(userId, 'approved');
    await this.awardBadge(userId, 'new-member');
    await this.checkFirstBlood(userId, categoryId);
  }

  // Master check - run all checks
  static async checkAllBadges(userId: string | Types.ObjectId, categoryId?: string | Types.ObjectId): Promise<void> {
    try {
      await this.checkVoteBadges(userId);
      await this.checkEngagementBadges(userId);
      await this.checkSocialBadges(userId);
      await this.checkSpecialBadges(userId);

      if (categoryId) {
        await this.checkRankingBadges(userId, categoryId);
      }

      console.log(`✅ Checked all badges for user ${userId}`);
    } catch (error) {
      console.error('Check all badges error:', error);
    }
  }
}

export default BadgeService;
