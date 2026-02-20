import { Link } from 'react-router-dom';
import { Twitter, UserPlus, Vote, TrendingUp, Users, BarChart3, FolderOpen, ArrowRight, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

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
    description: 'Sign in with your X account to join the community',
  },
  {
    icon: Vote,
    title: 'Vote',
    description: 'Vote for who you think deserves the top rank in each category',
  },
  {
    icon: TrendingUp,
    title: 'Climb',
    description: 'Get votes, rise in the rankings, and earn your place at the top',
  },
];

interface StatItem {
  icon: LucideIcon;
  label: string;
  value: string;
}

const stats: StatItem[] = [
  { icon: Users, label: 'Active Users', value: '1,000+' },
  { icon: BarChart3, label: 'Votes Cast', value: '10,000+' },
  { icon: FolderOpen, label: 'Categories', value: '18' },
];

export default function LandingPage() {
  const { user, signInWithTwitter } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="hero-starfield relative min-h-screen flex flex-col items-center justify-center px-4 text-center">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/30 to-[#0A0A0A]" />
        
        <div className="relative z-10 mx-auto max-w-4xl">
          <motion.h1
            {...fadeIn}
            transition={{ duration: 0.6 }}
            className="text-hero-heading mb-6 leading-tight text-white"
          >
            Rank the best
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">voices on X</span>
          </motion.h1>

          <motion.p
            {...fadeIn}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-subheading mb-12 max-w-2xl mx-auto text-gray-400"
          >
            The community-driven leaderboard for X. Vote for the top creators,
            founders, developers, and shitposters across dozens of categories.
          </motion.p>

          <motion.div
            {...fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            {user ? (
              <Link
                to="/categories"
                className="btn-primary btn-large"
              >
                <FolderOpen size={20} />
                Browse Categories
              </Link>
            ) : (
              <button
                onClick={signInWithTwitter}
                className="btn-primary btn-large"
              >
                <Twitter size={20} />
                Connect with X
              </button>
            )}
            <Link
              to="/categories"
              className="btn-secondary px-8 py-3 text-lg font-medium"
            >
              View Leaderboards
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>

        {/* Decorative gradient blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-white/5 to-transparent blur-3xl" />
      </section>

      {/* How It Works */}
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
            <p className="text-subheading text-gray-400 max-w-2xl mx-auto">
              Three simple steps to participate in the community rankings
            </p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ borderColor: '#555', scale: 1.02 }}
                className="card card-padding relative overflow-hidden"
              >
                {/* Step number background */}
                <div className="absolute top-4 left-4 text-8xl font-bold text-gray-800/20 -z-0">
                  {String(i + 1).padStart(2, '0')}
                </div>
                
                <div className="relative z-10">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2A2A2A]">
                    <step.icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-card-heading mb-2 text-white">
                    {step.title}
                  </h3>
                  <p className="text-body-small">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-[#222] px-4 py-24 bg-[#0A0A0A]">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-3">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="flex flex-col items-center py-6 text-center"
              >
                <stat.icon size={32} className="mb-3 text-gray-600" />
                <span className="text-5xl font-bold text-white">{stat.value}</span>
                <span className="text-body-small mt-2">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-[#222] px-4 py-24 bg-[#0A0A0A]">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-section-heading mb-4 text-white">
              Ready to claim your rank?
            </h2>
            <p className="text-subheading text-gray-400 mb-8">
              Join the community and start voting for the best voices on X.
            </p>
            <Link
              to="/categories"
              className="btn-primary btn-large"
            >
              <FolderOpen size={18} />
              Browse Categories
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
