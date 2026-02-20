import { Link, useLocation } from 'react-router-dom';
import { Twitter, LayoutDashboard, LogOut, Trophy, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, signInWithTwitter, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/categories', label: 'Categories' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-[#333] bg-[#0A0A0A]/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="navbar-height flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-black font-bold">
              <Trophy size={24} />
            </div>
            <span className="hidden sm:inline text-xl font-bold text-white">RankX</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${
                    isActive('/dashboard')
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to={`/profile/${user.handle}`}
                  className="flex items-center"
                >
                  <img
                    src={user.avatar_url}
                    alt={user.display_name}
                    className="h-8 w-8 rounded-full border-2 border-[#333] hover:border-[#555] transition-colors duration-200"
                  />
                </Link>
                <button
                  onClick={signOut}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A1A1A] transition-colors duration-200"
                  aria-label="Sign out"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <button
                onClick={signInWithTwitter}
                className="btn-primary py-2 px-4 text-sm"
              >
                <Twitter size={16} />
                Connect with X
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-white hover:bg-[#1A1A1A] transition-colors duration-200"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="border-t border-[#333] py-4 md:hidden bg-[#0A0A0A]">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive(link.path)
                      ? 'bg-[#1A1A1A] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#1A1A1A] rounded-lg transition-colors duration-200"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                  <Link
                    to={`/profile/${user.handle}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#1A1A1A] rounded-lg transition-colors duration-200"
                  >
                    <img
                      src={user.avatar_url}
                      alt=""
                      className="h-6 w-6 rounded-full border border-[#333]"
                    />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#1A1A1A] rounded-lg transition-colors duration-200 text-left w-full"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    signInWithTwitter();
                    setMobileOpen(false);
                  }}
                  className="btn-primary py-2 px-4 text-sm w-full justify-center"
                >
                  <Twitter size={16} />
                  Connect with X
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
