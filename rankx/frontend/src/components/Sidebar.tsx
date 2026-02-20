import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Grid3X3, User, LogOut, Trophy, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/categories', label: 'Categories', icon: Grid3X3 },
];

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-64 flex-col border-r border-[#222] bg-[#0A0A0A] z-40">
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive(item.path)
                ? 'bg-[#1A1A1A] text-white border border-[#333]'
                : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]/50'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}

        {user && (
          <Link
            to={`/profile/${user.handle}`}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              location.pathname.startsWith('/profile')
                ? 'bg-[#1A1A1A] text-white border border-[#333]'
                : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]/50'
            }`}
          >
            <User size={18} />
            Profile
          </Link>
        )}
      </nav>

      {/* Bottom section */}
      {user && (
        <div className="border-t border-[#222] p-4 space-y-2">
          {/* User */}
          <Link
            to={`/profile/${user.handle}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1A1A1A] transition-colors group"
          >
            <img
              src={user.avatar_url}
              alt={user.display_name}
              className="h-9 w-9 rounded-full border-2 border-[#333] group-hover:border-[#555] transition-colors"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.display_name}</p>
              <p className="text-xs text-gray-500 truncate">@{user.handle}</p>
            </div>
          </Link>

          {/* Sign out */}
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-900/10 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
