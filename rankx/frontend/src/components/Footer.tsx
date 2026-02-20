import { Link } from 'react-router-dom';
import { Trophy, Twitter, Github, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#222] bg-[#0A0A0A]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-black font-bold">
                <Trophy size={24} />
              </div>
              <span className="text-xl font-bold text-white">RankX</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              The community-driven leaderboard for X. Vote for the top creators across dozens of categories.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/categories" className="text-sm text-gray-400 hover:text-white transition-colors">Categories</Link></li>
              <li><Link to="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-3">
              <li><span className="text-sm text-gray-400">About</span></li>
              <li><span className="text-sm text-gray-400">Privacy Policy</span></li>
              <li><span className="text-sm text-gray-400">Terms of Service</span></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Connect</h4>
            <div className="flex items-center gap-3">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#333] text-gray-400 hover:text-white hover:border-[#555] transition-all"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#333] text-gray-400 hover:text-white hover:border-[#555] transition-all"
              >
                <Github size={18} />
              </a>
              <a
                href="mailto:hello@rankx.com"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#333] text-gray-400 hover:text-white hover:border-[#555] transition-all"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#222] flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} RankX. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Built for the X community
          </p>
        </div>
      </div>
    </footer>
  );
}
