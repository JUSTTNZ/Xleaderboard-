import 'dotenv/config';
import mongoose from 'mongoose';
import Category from './models/Category';
import User from './models/User';

interface SeedCategory {
  name: string;
  slug: string;
  description: string;
  icon: string;
}

const categories: SeedCategory[] = [
  { name: 'Tech Founders (Bootstrapped)', slug: 'tech-founders-bootstrapped', description: 'Self-funded tech founders building without VC money', icon: 'Briefcase' },
  { name: 'Tech Founders (VC-backed)', slug: 'tech-founders-vc', description: 'Venture-capital backed tech founders scaling fast', icon: 'DollarSign' },
  { name: 'Solo Founders', slug: 'solo-founders', description: 'One-person armies building entire products alone', icon: 'Rocket' },
  { name: 'Tech CEOs', slug: 'tech-ceos', description: 'Chief executives leading technology companies', icon: 'Building' },
  { name: 'Product Managers', slug: 'product-managers', description: 'PMs shipping great products and features', icon: 'Target' },
  { name: 'UI/UX Designers', slug: 'ui-ux-designers', description: 'Designers crafting beautiful user experiences', icon: 'Palette' },
  { name: 'Frontend Developers', slug: 'frontend-developers', description: 'Engineers building stunning web interfaces', icon: 'Code' },
  { name: 'Backend Developers', slug: 'backend-developers', description: 'Engineers powering the server side', icon: 'Server' },
  { name: 'AI Researchers', slug: 'ai-researchers', description: 'Pioneers in artificial intelligence and machine learning', icon: 'Brain' },
  { name: 'Open Source Contributors', slug: 'open-source-contributors', description: 'Builders contributing to the open source ecosystem', icon: 'GitBranch' },
  { name: 'Tech Writers', slug: 'tech-writers', description: 'Writers making technical content accessible', icon: 'FileText' },
  { name: 'Crypto/Web3 Builders', slug: 'crypto-web3-builders', description: 'Builders in the decentralized web space', icon: 'Coins' },
  { name: 'SaaS Founders', slug: 'saas-founders', description: 'Founders building software-as-a-service products', icon: 'Box' },
  { name: 'Indie Hackers', slug: 'indie-hackers', description: 'Independent makers building profitable side projects', icon: 'Rocket' },
  { name: 'Shitposters', slug: 'shitposters', description: 'The finest comedic voices on X', icon: 'MessagesSquare' },
  { name: 'Thread Masters', slug: 'thread-masters', description: 'Creators of legendary X threads', icon: 'ListOrdered' },
  { name: 'Meme Lords', slug: 'meme-lords', description: 'The undisputed rulers of internet humor', icon: 'Laugh' },
  { name: 'Hot Take Artists', slug: 'hot-take-artists', description: 'Bold opinions that spark the best debates', icon: 'Zap' },
];

async function seed(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    for (const cat of categories) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        { ...cat, is_active: true, requires_approval: true },
        { upsert: true, returnDocument: 'after' }
      );
      console.log(`Seeded: ${cat.name}`);
    }

    // Set @codebynz as permanent admin (case-insensitive)
    const adminResult = await User.findOneAndUpdate(
      { handle: { $regex: /^codebynz$/i } },
      { is_admin: true },
      { returnDocument: 'after' }
    );
    if (adminResult) {
      console.log(`Admin set: @${adminResult.handle} (is_admin: true)`);
    } else {
      console.log('Admin user @codebynz not found yet — will be set on first login. Run seed again after they sign in.');
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
