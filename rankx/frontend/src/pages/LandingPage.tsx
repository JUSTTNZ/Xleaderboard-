import { Link } from 'react-router-dom';
import { Twitter, UserPlus, Vote, TrendingUp, Users, BarChart3, FolderOpen, ArrowRight, Shield, Zap, Target, Crown, Award, Globe, type LucideIcon } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Footer from '../components/Footer';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: UserPlus,
    title: 'Connect',
    description: 'Sign in with your X account to join the community and start participating in rankings.',
  },
  {
    icon: Vote,
    title: 'Vote',
    description: 'Vote for who you think deserves the top rank in each category. One vote per category.',
  },
  {
    icon: TrendingUp,
    title: 'Climb',
    description: 'Get votes from the community, rise in the rankings, and earn your place at the top.',
  },
];

interface StatItem {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix: string;
}

const stats: StatItem[] = [
  { icon: Users, label: 'Active Users', value: 1000, suffix: '+' },
  { icon: BarChart3, label: 'Votes Cast', value: 10000, suffix: '+' },
  { icon: FolderOpen, label: 'Categories', value: 18, suffix: '' },
];

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  visual: 'chart' | 'ranks' | 'badges';
}

const features: Feature[] = [
  {
    icon: Target,
    title: 'Community-Driven Rankings',
    description: 'No algorithms, no bias. Rankings are determined purely by community votes. The people decide who rises to the top across every category.',
    visual: 'chart',
  },
  {
    icon: Shield,
    title: 'Verified X Accounts Only',
    description: 'Every participant authenticates through X (Twitter). Real people, real votes, real rankings. No bots, no fake accounts.',
    visual: 'ranks',
  },
  {
    icon: Zap,
    title: 'Real-Time Leaderboards',
    description: 'Watch rankings update in real-time as votes come in. Track your position, see who\'s climbing, and compete for the top spots.',
    visual: 'badges',
  },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref} className="text-5xl sm:text-6xl font-bold text-white tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

function FeatureChartVisual() {
  const bars = [40, 65, 50, 80, 60, 90, 70, 85, 55, 75, 95, 60];
  return (
    <div className="feature-visual h-64 flex items-end gap-1.5 px-4 pb-4">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          whileInView={{ height: `${h}%` }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex-1 rounded-t bg-white/15 hover:bg-white/30 transition-colors"
        />
      ))}
    </div>
  );
}

function FeatureRanksVisual() {
  const ranks = [
    { name: 'Alex Chen', rank: 1, votes: 842 },
    { name: 'Sarah K.', rank: 2, votes: 731 },
    { name: 'DevMaster', rank: 3, votes: 689 },
    { name: 'CodeNinja', rank: 4, votes: 524 },
  ];
  return (
    <div className="feature-visual h-64 p-4 flex flex-col gap-3 justify-center">
      {ranks.map((r, i) => (
        <motion.div
          key={r.name}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/5 border border-white/5"
        >
          <span className={`text-sm font-bold w-8 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-500' : 'text-gray-600'}`}>
            #{r.rank}
          </span>
          <div className="h-7 w-7 rounded-full bg-white/10" />
          <span className="text-sm text-white flex-1">{r.name}</span>
          <span className="text-xs text-gray-500">{r.votes} votes</span>
        </motion.div>
      ))}
    </div>
  );
}

function FeatureBadgesVisual() {
  const badges = [
    { icon: Crown, label: 'Top Ranked', color: 'text-yellow-500' },
    { icon: Award, label: 'Rising Star', color: 'text-blue-400' },
    { icon: Zap, label: 'Power Voter', color: 'text-green-400' },
    { icon: Globe, label: 'Multi-Category', color: 'text-purple-400' },
    { icon: Shield, label: 'Verified', color: 'text-white' },
    { icon: TrendingUp, label: 'Climber', color: 'text-orange-400' },
  ];
  return (
    <div className="feature-visual h-64 p-4 grid grid-cols-3 gap-3 place-content-center">
      {badges.map((b, i) => (
        <motion.div
          key={b.label}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          className="flex flex-col items-center gap-2 py-3 rounded-lg bg-white/5 border border-white/5"
        >
          <b.icon size={20} className={b.color} />
          <span className="text-[10px] text-gray-500 text-center leading-tight">{b.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

const featureVisuals = {
  chart: FeatureChartVisual,
  ranks: FeatureRanksVisual,
  badges: FeatureBadgesVisual,
};

export default function LandingPage() {
  const { user, signInWithTwitter } = useAuth();

  return (
    <div className="flex flex-col -mt-16">
      {/* ======================== HERO ======================== */}
      <section className="hero-starfield relative min-h-screen flex flex-col items-center justify-center px-4 text-center">
        {/* Animated twinkle layer */}
        <div className="hero-starfield-twinkle" />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/20 to-[#0A0A0A] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0A0A0A_70%)] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl pt-16">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#333] bg-[#1A1A1A]/80 px-4 py-1.5 text-xs font-medium text-gray-400 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Community-driven rankings for X
          </motion.div>

          <motion.h1
            {...fadeIn}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-hero-heading mb-6 text-white"
          >
            Rank the best
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">voices on X</span>
          </motion.h1>

          <motion.p
            {...fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl mb-12 max-w-2xl mx-auto text-gray-400 leading-relaxed"
          >
            The community-driven leaderboard for X. Vote for the top creators,
            founders, developers, and shitposters across dozens of categories.
          </motion.p>

          <motion.div
            {...fadeIn}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            {user ? (
              <Link to="/categories" className="btn-primary btn-large">
                <FolderOpen size={20} />
                Browse Categories
              </Link>
            ) : (
              <button onClick={signInWithTwitter} className="btn-primary btn-large">
                <Twitter size={20} />
                Connect with X
              </button>
            )}
            <Link to="/categories" className="btn-secondary px-8 py-4 text-lg font-medium">
              View Leaderboards
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>

        {/* Decorative gradient blur */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-white/[0.03] to-transparent blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-l from-white/[0.02] to-transparent blur-3xl rounded-full pointer-events-none" />
      </section>

      {/* ======================== STATS ======================== */}
      <section className="relative border-t border-[#222] px-4 py-20 bg-[#0A0A0A]">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 sm:grid-cols-3">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="flex flex-col items-center py-8 text-center"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1A1A1A] border border-[#333]">
                  <stat.icon size={24} className="text-gray-500" />
                </div>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                <span className="text-sm text-gray-500 mt-2 font-medium">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== HOW IT WORKS ======================== */}
      <section className="border-t border-[#222] px-4 py-24 bg-[#0A0A0A]">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-section-heading mb-4 text-white">
              How it works
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Three simple steps to participate in the community rankings
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 * i, duration: 0.5 }}
                className="card-interactive card-padding relative overflow-hidden group"
              >
                {/* Step number background */}
                <div className="absolute top-2 right-4 text-[7rem] font-black text-white/[0.03] leading-none select-none pointer-events-none">
                  {String(i + 1).padStart(2, '0')}
                </div>

                <div className="relative z-10">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2A2A2A] border border-[#333] group-hover:border-[#444] transition-colors">
                    <step.icon size={26} className="text-white" />
                  </div>
                  <h3 className="text-card-heading mb-3 text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== FEATURES SHOWCASE ======================== */}
      <section className="border-t border-[#222] px-4 py-24 bg-[#0A0A0A]">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 text-center"
          >
            <h2 className="text-section-heading mb-4 text-white">
              Built for the community
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Everything you need to discover, vote for, and track the best voices on X
            </p>
          </motion.div>

          <div className="space-y-24">
            {features.map((feature, i) => {
              const Visual = featureVisuals[feature.visual];
              const isReversed = i % 2 === 1;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6 }}
                  className={`grid gap-12 items-center lg:grid-cols-2 ${isReversed ? 'lg:direction-rtl' : ''}`}
                >
                  <div className={`space-y-6 ${isReversed ? 'lg:order-2' : ''}`}>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1A1A1A] border border-[#333]">
                      <feature.icon size={26} className="text-white" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed text-lg">
                      {feature.description}
                    </p>
                  </div>
                  <div className={isReversed ? 'lg:order-1' : ''}>
                    <Visual />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================== FINAL CTA ======================== */}
      <section className="border-t border-[#222] px-4 py-24 bg-[#0A0A0A] relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-white/[0.02] via-white/[0.04] to-white/[0.02] blur-3xl rounded-full pointer-events-none" />

        <div className="mx-auto flex max-w-2xl flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-section-heading text-white">
              Ready to claim your rank?
            </h2>
            <p className="text-lg text-gray-400 max-w-lg mx-auto">
              Join the community and start voting for the best voices on X. Your vote shapes the leaderboard.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-4">
              {user ? (
                <Link to="/categories" className="btn-primary btn-large">
                  <FolderOpen size={18} />
                  Browse Categories
                </Link>
              ) : (
                <button onClick={signInWithTwitter} className="btn-primary btn-large">
                  <Twitter size={18} />
                  Get Started
                </button>
              )}
              <Link to="/categories" className="btn-secondary px-8 py-4 text-lg">
                Explore Rankings
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======================== FOOTER ======================== */}
      <Footer />
    </div>
  );
}
