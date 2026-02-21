import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Badge from '../models/Badge';

dotenv.config();

const badges = [
  // === RANKING BADGES (30) ===

  // Tier: Legendary (Gold)
  {
    name: 'Category King',
    slug: 'category-king',
    description: 'Reach #1 in any category',
    icon: 'Crown',
    color: '#FFD700',
    tier: 'legendary',
    category: 'ranking',
    criteria_type: 'rank',
    criteria_value: 1,
    points: 1000
  },
  {
    name: 'Flawless Victory',
    slug: 'flawless-victory',
    description: 'Reach #1 with 100+ vote lead over #2',
    icon: 'Trophy',
    color: '#FFD700',
    tier: 'legendary',
    category: 'ranking',
    criteria_type: 'rank',
    criteria_value: 1,
    points: 1500
  },
  {
    name: 'Diamond Throne',
    slug: 'diamond-throne',
    description: 'Hold #1 position for 30 consecutive days',
    icon: 'Gem',
    color: '#FFD700',
    tier: 'legendary',
    category: 'ranking',
    criteria_type: 'rank',
    criteria_value: 1,
    points: 2000
  },
  {
    name: 'Lightning Crown',
    slug: 'lightning-crown',
    description: 'Reach #1 within 7 days of joining category',
    icon: 'Zap',
    color: '#FFD700',
    tier: 'legendary',
    category: 'ranking',
    criteria_type: 'rank',
    criteria_value: 1,
    points: 1200
  },
  {
    name: 'Triple Threat',
    slug: 'triple-threat',
    description: 'Reach top 3 in a category before switching',
    icon: 'Target',
    color: '#FFD700',
    tier: 'legendary',
    category: 'ranking',
    criteria_type: 'rank',
    criteria_value: 3,
    points: 800
  },

  // Tier: Epic (Purple)
  {
    name: 'Gold Medalist',
    slug: 'gold-medalist',
    description: 'Achieve #1 rank in any category',
    icon: 'Medal',
    color: '#FFD700',
    tier: 'epic',
    category: 'ranking',
    criteria_type: 'rank',
    criteria_value: 1,
    points: 500
  },
  {
    name: 'Silver Medalist',
    slug: 'silver-medalist',
    description: 'Achieve #2 rank in any category',
    icon: 'Medal',
    color: '#C0C0C0',
    tier: 'epic',
    category: 'ranking',
    criteria_type: 'rank',
    criteria_value: 2,
    points: 300
  },
  {
    name: 'Bronze Medalist',
    slug: 'bronze-medalist',
    description: 'Achieve #3 rank in any category',
    icon: 'Medal',
    color: '#CD7F32',
    tier: 'epic',
    category: 'ranking',
    criteria_type: 'rank',
    criteria_value: 3,
    points: 200
  },
  {
    name: 'Top 10 Club',
    slug: 'top-10-club',
    description: 'Reach top 10 in any category',
    icon: 'BarChart3',
    color: '#9333EA',
    tier: 'epic',
    category: 'ranking',
    criteria_type: 'rank',
    criteria_value: 10,
    points: 150
  },
  {
    name: 'Elite Ranker',
    slug: 'elite-ranker',
    description: 'Reach top 5 in any category',
    icon: 'Award',
    color: '#9333EA',
    tier: 'epic',
    category: 'ranking',
    criteria_type: 'rank',
    criteria_value: 5,
    points: 250
  },

  // Tier: Rare (Blue)
  {
    name: 'Rising Star',
    slug: 'rising-star',
    description: 'Jump 10+ ranks in one week',
    icon: 'TrendingUp',
    color: '#3B82F6',
    tier: 'rare',
    category: 'ranking',
    criteria_type: 'rank',
    criteria_value: 10,
    points: 200
  },
  {
    name: 'Meteor Rise',
    slug: 'meteor-rise',
    description: 'Jump 20+ ranks in one week',
    icon: 'Rocket',
    color: '#3B82F6',
    tier: 'rare',
    category: 'ranking',
    criteria_type: 'rank',
    criteria_value: 20,
    points: 300
  },
  {
    name: 'Steady Climber',
    slug: 'steady-climber',
    description: 'Improve rank for 5 consecutive weeks',
    icon: 'TrendingUp',
    color: '#3B82F6',
    tier: 'rare',
    category: 'ranking',
    criteria_type: 'rank',
    criteria_value: 5,
    points: 250
  },
  {
    name: 'Mountain Climber',
    slug: 'mountain-climber',
    description: 'Climb from #50+ to top 10',
    icon: 'Mountain',
    color: '#3B82F6',
    tier: 'rare',
    category: 'ranking',
    criteria_type: 'rank',
    criteria_value: 10,
    points: 400
  },

  // Tier: Uncommon (Green)
  {
    name: 'First Blood',
    slug: 'first-blood',
    description: 'Be the first person to join a category',
    icon: 'Users',
    color: '#10B981',
    tier: 'uncommon',
    category: 'ranking',
    criteria_type: 'categories',
    criteria_value: 1,
    points: 500,
    is_secret: true
  },
  {
    name: 'Founding Member',
    slug: 'founding-member',
    description: 'Join category within first 10 members',
    icon: 'Star',
    color: '#10B981',
    tier: 'uncommon',
    category: 'ranking',
    criteria_type: 'categories',
    criteria_value: 10,
    points: 150
  },
  {
    name: 'Early Adopter',
    slug: 'early-adopter',
    description: 'Join category within first 50 members',
    icon: 'Zap',
    color: '#10B981',
    tier: 'uncommon',
    category: 'ranking',
    criteria_type: 'categories',
    criteria_value: 50,
    points: 100
  },
  {
    name: 'Trailblazer',
    slug: 'trailblazer',
    description: 'Join a newly created category',
    icon: 'MapPin',
    color: '#10B981',
    tier: 'uncommon',
    category: 'ranking',
    criteria_type: 'categories',
    criteria_value: 1,
    points: 200
  },

  // Tier: Common (Gray)
  {
    name: 'New Member',
    slug: 'new-member',
    description: 'Join your first category',
    icon: 'UserPlus',
    color: '#6B7280',
    tier: 'common',
    category: 'ranking',
    criteria_type: 'categories',
    criteria_value: 1,
    points: 10
  },
  {
    name: 'Applicant',
    slug: 'applicant',
    description: 'Submit your first application',
    icon: 'FileText',
    color: '#6B7280',
    tier: 'common',
    category: 'ranking',
    criteria_type: 'categories',
    criteria_value: 1,
    points: 5
  },
  {
    name: 'Approved',
    slug: 'approved',
    description: 'Get your first application approved',
    icon: 'CheckCircle',
    color: '#6B7280',
    tier: 'common',
    category: 'ranking',
    criteria_type: 'categories',
    criteria_value: 1,
    points: 10
  },
  {
    name: 'On The Board',
    slug: 'on-the-board',
    description: 'Appear on a leaderboard for the first time',
    icon: 'BarChart3',
    color: '#6B7280',
    tier: 'common',
    category: 'ranking',
    criteria_type: 'rank',
    criteria_value: 100,
    points: 20
  },

  // === VOTE BADGES (25) ===

  // Tier: Legendary (Gold)
  {
    name: 'Century Club',
    slug: 'century-club',
    description: 'Receive 100+ total votes',
    icon: 'Award',
    color: '#FFD700',
    tier: 'legendary',
    category: 'votes',
    criteria_type: 'votes',
    criteria_value: 100,
    points: 1000
  },
  {
    name: 'Half Thousand',
    slug: 'half-thousand',
    description: 'Receive 500+ total votes',
    icon: 'Sparkles',
    color: '#FFD700',
    tier: 'legendary',
    category: 'votes',
    criteria_type: 'votes',
    criteria_value: 500,
    points: 2000
  },
  {
    name: 'Thousand Fans',
    slug: 'thousand-fans',
    description: 'Receive 1,000+ total votes',
    icon: 'Users',
    color: '#FFD700',
    tier: 'legendary',
    category: 'votes',
    criteria_type: 'votes',
    criteria_value: 1000,
    points: 5000
  },
  {
    name: 'Five Thousand Club',
    slug: 'five-thousand-club',
    description: 'Receive 5,000+ total votes',
    icon: 'Star',
    color: '#FFD700',
    tier: 'legendary',
    category: 'votes',
    criteria_type: 'votes',
    criteria_value: 5000,
    points: 8000
  },
  {
    name: 'Ten Thousand Legend',
    slug: 'ten-thousand-legend',
    description: 'Receive 10,000+ total votes',
    icon: 'Gem',
    color: '#FFD700',
    tier: 'legendary',
    category: 'votes',
    criteria_type: 'votes',
    criteria_value: 10000,
    points: 15000
  },

  // Tier: Epic (Purple)
  {
    name: 'On Fire',
    slug: 'on-fire',
    description: 'Receive 50+ votes in one day',
    icon: 'Flame',
    color: '#9333EA',
    tier: 'epic',
    category: 'votes',
    criteria_type: 'votes',
    criteria_value: 50,
    points: 500
  },
  {
    name: 'Vote Storm',
    slug: 'vote-storm',
    description: 'Receive 100+ votes in one week',
    icon: 'Zap',
    color: '#9333EA',
    tier: 'epic',
    category: 'votes',
    criteria_type: 'votes',
    criteria_value: 100,
    points: 800
  },
  {
    name: 'Tsunami',
    slug: 'tsunami',
    description: 'Receive 200+ votes in one week',
    icon: 'Waves',
    color: '#9333EA',
    tier: 'epic',
    category: 'votes',
    criteria_type: 'votes',
    criteria_value: 200,
    points: 1200
  },

  // Tier: Rare (Blue)
  {
    name: 'Popular',
    slug: 'popular',
    description: 'Receive 50+ total votes',
    icon: 'Star',
    color: '#3B82F6',
    tier: 'rare',
    category: 'votes',
    criteria_type: 'votes',
    criteria_value: 50,
    points: 200
  },
  {
    name: 'Well Known',
    slug: 'well-known',
    description: 'Receive 25+ total votes',
    icon: 'Award',
    color: '#3B82F6',
    tier: 'rare',
    category: 'votes',
    criteria_type: 'votes',
    criteria_value: 25,
    points: 100
  },
  {
    name: 'Appreciated',
    slug: 'appreciated',
    description: 'Receive 10+ total votes',
    icon: 'Heart',
    color: '#3B82F6',
    tier: 'rare',
    category: 'votes',
    criteria_type: 'votes',
    criteria_value: 10,
    points: 50
  },
  {
    name: 'Growing',
    slug: 'growing',
    description: 'Receive 5+ votes',
    icon: 'Sprout',
    color: '#3B82F6',
    tier: 'rare',
    category: 'votes',
    criteria_type: 'votes',
    criteria_value: 5,
    points: 25
  },

  // Tier: Uncommon (Green)
  {
    name: 'First Supporter',
    slug: 'first-supporter',
    description: 'Receive your first vote',
    icon: 'Gift',
    color: '#10B981',
    tier: 'uncommon',
    category: 'votes',
    criteria_type: 'votes',
    criteria_value: 1,
    points: 10
  },
  {
    name: 'Community Loved',
    slug: 'community-loved',
    description: 'Receive votes from 10+ different people',
    icon: 'Users',
    color: '#10B981',
    tier: 'uncommon',
    category: 'votes',
    criteria_type: 'votes',
    criteria_value: 10,
    points: 100
  },
  {
    name: 'Widely Supported',
    slug: 'widely-supported',
    description: 'Receive votes from 25+ different people',
    icon: 'Globe',
    color: '#10B981',
    tier: 'uncommon',
    category: 'votes',
    criteria_type: 'votes',
    criteria_value: 25,
    points: 200
  },
  {
    name: 'Crowd Favorite',
    slug: 'crowd-favorite',
    description: 'Receive votes from 50+ different people',
    icon: 'Users',
    color: '#10B981',
    tier: 'uncommon',
    category: 'votes',
    criteria_type: 'votes',
    criteria_value: 50,
    points: 400
  },
  {
    name: 'Universally Acclaimed',
    slug: 'universally-acclaimed',
    description: 'Receive votes from 100+ different people',
    icon: 'Sparkles',
    color: '#10B981',
    tier: 'uncommon',
    category: 'votes',
    criteria_type: 'votes',
    criteria_value: 100,
    points: 800
  },

  // === ENGAGEMENT BADGES (20) ===

  // Voting Cast Badges
  {
    name: 'First Vote',
    slug: 'first-vote',
    description: 'Cast your first vote',
    icon: 'ThumbsUp',
    color: '#6B7280',
    tier: 'common',
    category: 'engagement',
    criteria_type: 'votes',
    criteria_value: 1,
    points: 5
  },
  {
    name: 'Voter',
    slug: 'voter',
    description: 'Cast 10 votes',
    icon: 'Target',
    color: '#10B981',
    tier: 'uncommon',
    category: 'engagement',
    criteria_type: 'votes',
    criteria_value: 10,
    points: 50
  },
  {
    name: 'Active Voter',
    slug: 'active-voter',
    description: 'Cast 25 votes',
    icon: 'Vote',
    color: '#3B82F6',
    tier: 'rare',
    category: 'engagement',
    criteria_type: 'votes',
    criteria_value: 25,
    points: 100
  },
  {
    name: 'Super Voter',
    slug: 'super-voter',
    description: 'Cast 50 votes',
    icon: 'Trophy',
    color: '#9333EA',
    tier: 'epic',
    category: 'engagement',
    criteria_type: 'votes',
    criteria_value: 50,
    points: 200
  },
  {
    name: 'Elite Voter',
    slug: 'elite-voter',
    description: 'Cast 100+ votes',
    icon: 'Gem',
    color: '#FFD700',
    tier: 'legendary',
    category: 'engagement',
    criteria_type: 'votes',
    criteria_value: 100,
    points: 500
  },

  // Streak Badges
  {
    name: 'Week Warrior',
    slug: 'week-warrior',
    description: 'Vote at least once for 7 consecutive days',
    icon: 'Calendar',
    color: '#3B82F6',
    tier: 'rare',
    category: 'engagement',
    criteria_type: 'special',
    criteria_value: 7,
    points: 150
  },
  {
    name: 'Month Master',
    slug: 'month-master',
    description: 'Vote at least once for 30 consecutive days',
    icon: 'Calendar',
    color: '#9333EA',
    tier: 'epic',
    category: 'engagement',
    criteria_type: 'special',
    criteria_value: 30,
    points: 500
  },
  {
    name: 'Centurion',
    slug: 'centurion',
    description: 'Maintain 100-day voting streak',
    icon: 'Award',
    color: '#FFD700',
    tier: 'legendary',
    category: 'engagement',
    criteria_type: 'special',
    criteria_value: 100,
    points: 2000
  },

  // Account Age Badges
  {
    name: 'One Week Old',
    slug: 'one-week-old',
    description: 'Account is 7 days old',
    icon: 'Cake',
    color: '#6B7280',
    tier: 'common',
    category: 'engagement',
    criteria_type: 'special',
    criteria_value: 7,
    points: 25
  },
  {
    name: 'One Month Member',
    slug: 'one-month-member',
    description: 'Account is 30 days old',
    icon: 'PartyPopper',
    color: '#10B981',
    tier: 'uncommon',
    category: 'engagement',
    criteria_type: 'special',
    criteria_value: 30,
    points: 100
  },
  {
    name: 'Three Month Veteran',
    slug: 'three-month-veteran',
    description: 'Account is 90 days old',
    icon: 'Sparkles',
    color: '#3B82F6',
    tier: 'rare',
    category: 'engagement',
    criteria_type: 'special',
    criteria_value: 90,
    points: 250
  },
  {
    name: 'Half Year Legend',
    slug: 'half-year-legend',
    description: 'Account is 180 days old',
    icon: 'Gem',
    color: '#9333EA',
    tier: 'epic',
    category: 'engagement',
    criteria_type: 'special',
    criteria_value: 180,
    points: 500
  },
  {
    name: 'One Year King',
    slug: 'one-year-king',
    description: 'Account is 365 days old',
    icon: 'Crown',
    color: '#FFD700',
    tier: 'legendary',
    category: 'engagement',
    criteria_type: 'special',
    criteria_value: 365,
    points: 1000
  },

  // === SOCIAL BADGES (15) ===

  // Twitter Followers
  {
    name: 'Twitter Newbie',
    slug: 'twitter-newbie',
    description: '100-500 Twitter followers',
    icon: 'Bird',
    color: '#6B7280',
    tier: 'common',
    category: 'social',
    criteria_type: 'special',
    criteria_value: 100,
    points: 25
  },
  {
    name: 'Growing Account',
    slug: 'growing-account',
    description: '500-1,000 Twitter followers',
    icon: 'Sprout',
    color: '#10B981',
    tier: 'uncommon',
    category: 'social',
    criteria_type: 'special',
    criteria_value: 500,
    points: 75
  },
  {
    name: 'Influencer',
    slug: 'influencer',
    description: '1,000-5,000 Twitter followers',
    icon: 'Megaphone',
    color: '#3B82F6',
    tier: 'rare',
    category: 'social',
    criteria_type: 'special',
    criteria_value: 1000,
    points: 200
  },
  {
    name: 'Notable',
    slug: 'notable',
    description: '5,000-10,000 Twitter followers',
    icon: 'Star',
    color: '#9333EA',
    tier: 'epic',
    category: 'social',
    criteria_type: 'special',
    criteria_value: 5000,
    points: 500
  },
  {
    name: 'Twitter Star',
    slug: 'twitter-star',
    description: '10,000+ Twitter followers',
    icon: 'Gem',
    color: '#FFD700',
    tier: 'legendary',
    category: 'social',
    criteria_type: 'special',
    criteria_value: 10000,
    points: 1000
  },
  {
    name: 'Mega Influencer',
    slug: 'mega-influencer',
    description: '100,000+ Twitter followers',
    icon: 'Crown',
    color: '#FFD700',
    tier: 'legendary',
    category: 'social',
    criteria_type: 'special',
    criteria_value: 100000,
    points: 5000
  },

  // Profile Completeness
  {
    name: 'Bio Writer',
    slug: 'bio-writer',
    description: 'Has Twitter bio',
    icon: 'Edit3',
    color: '#6B7280',
    tier: 'common',
    category: 'social',
    criteria_type: 'special',
    criteria_value: 1,
    points: 10
  },
  {
    name: 'Profile Picture',
    slug: 'profile-picture',
    description: 'Has profile picture',
    icon: 'Image',
    color: '#6B7280',
    tier: 'common',
    category: 'social',
    criteria_type: 'special',
    criteria_value: 1,
    points: 10
  },
  {
    name: 'Styled',
    slug: 'styled',
    description: 'Has both bio and picture',
    icon: 'Palette',
    color: '#10B981',
    tier: 'uncommon',
    category: 'social',
    criteria_type: 'special',
    criteria_value: 2,
    points: 25
  },

  // Community Building
  {
    name: 'Supporter',
    slug: 'supporter',
    description: 'Vote for 10 different people',
    icon: 'Users',
    color: '#10B981',
    tier: 'uncommon',
    category: 'social',
    criteria_type: 'special',
    criteria_value: 10,
    points: 50
  },
  {
    name: 'Community Builder',
    slug: 'community-builder',
    description: 'Vote for 25 different people',
    icon: 'Globe',
    color: '#3B82F6',
    tier: 'rare',
    category: 'social',
    criteria_type: 'special',
    criteria_value: 25,
    points: 150
  },
  {
    name: 'Connector',
    slug: 'connector',
    description: 'Vote for 50 different people',
    icon: 'Sparkles',
    color: '#9333EA',
    tier: 'epic',
    category: 'social',
    criteria_type: 'special',
    criteria_value: 50,
    points: 300
  },
  {
    name: 'Network King',
    slug: 'network-king',
    description: 'Vote for 100 different people',
    icon: 'Users',
    color: '#FFD700',
    tier: 'legendary',
    category: 'social',
    criteria_type: 'special',
    criteria_value: 100,
    points: 800
  },

  // === SPECIAL BADGES (10) ===

  {
    name: 'Admin',
    slug: 'admin',
    description: 'Platform administrator',
    icon: 'Shield',
    color: '#FFD700',
    tier: 'legendary',
    category: 'special',
    criteria_type: 'special',
    criteria_value: 1,
    points: 0,
    is_secret: false
  },
  {
    name: 'Beta Tester',
    slug: 'beta-tester',
    description: 'Joined during beta period',
    icon: 'Award',
    color: '#9333EA',
    tier: 'epic',
    category: 'special',
    criteria_type: 'special',
    criteria_value: 1,
    points: 500,
    is_secret: false
  },
  {
    name: 'Launch Day',
    slug: 'launch-day',
    description: 'Joined on platform launch day',
    icon: 'Trophy',
    color: '#FFD700',
    tier: 'legendary',
    category: 'special',
    criteria_type: 'special',
    criteria_value: 1,
    points: 1000,
    is_secret: false
  },
  {
    name: 'Bug Hunter',
    slug: 'bug-hunter',
    description: 'Reported a critical bug',
    icon: 'Bug',
    color: '#10B981',
    tier: 'uncommon',
    category: 'special',
    criteria_type: 'special',
    criteria_value: 1,
    points: 200
  },
  {
    name: 'Idea Generator',
    slug: 'idea-generator',
    description: 'Suggest feature that gets implemented',
    icon: 'Lightbulb',
    color: '#3B82F6',
    tier: 'rare',
    category: 'special',
    criteria_type: 'special',
    criteria_value: 1,
    points: 150
  },
  {
    name: 'Gift Giver',
    slug: 'gift-giver',
    description: 'Refer 10 users who join',
    icon: 'Gift',
    color: '#9333EA',
    tier: 'epic',
    category: 'special',
    criteria_type: 'special',
    criteria_value: 10,
    points: 500
  },
  {
    name: 'VIP',
    slug: 'vip',
    description: 'Invited by admin',
    icon: 'Star',
    color: '#FFD700',
    tier: 'legendary',
    category: 'special',
    criteria_type: 'special',
    criteria_value: 1,
    points: 250
  },
  {
    name: 'Anniversary',
    slug: 'anniversary',
    description: 'Account 1 year old',
    icon: 'PartyPopper',
    color: '#FFD700',
    tier: 'legendary',
    category: 'special',
    criteria_type: 'special',
    criteria_value: 365,
    points: 500
  },
  {
    name: 'Hall of Fame',
    slug: 'hall-of-fame',
    description: 'Featured on platform homepage',
    icon: 'Award',
    color: '#FFD700',
    tier: 'legendary',
    category: 'special',
    criteria_type: 'special',
    criteria_value: 1,
    points: 2000,
    is_secret: false
  },
  {
    name: 'Diamond Member',
    slug: 'diamond-member',
    description: 'All achievements unlocked',
    icon: 'Gem',
    color: '#FFD700',
    tier: 'legendary',
    category: 'special',
    criteria_type: 'special',
    criteria_value: 105,
    points: 10000,
    is_secret: true
  }
];

async function seedBadges() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rankx');
    console.log('Connected to MongoDB');

    // Clear existing badges
    await Badge.deleteMany({});
    console.log('Cleared existing badges');

    // Insert all badges
    await Badge.insertMany(badges);
    console.log(`✅ Successfully seeded ${badges.length} badges`);

    // Show breakdown
    const breakdown = await Badge.aggregate([
      {
        $group: {
          _id: '$tier',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\nBadge Breakdown by Tier:');
    breakdown.forEach(item => {
      console.log(`  ${item._id}: ${item.count} badges`);
    });

    const categoryBreakdown = await Badge.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\nBadge Breakdown by Category:');
    categoryBreakdown.forEach(item => {
      console.log(`  ${item._id}: ${item.count} badges`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedBadges();
