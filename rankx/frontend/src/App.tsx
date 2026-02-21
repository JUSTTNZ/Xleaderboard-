import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import CategoriesPage from './pages/CategoriesPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import BadgesPage from './pages/BadgesPage';
import AuthCallback from './pages/AuthCallback';
import AdminOverviewPage from './pages/admin/Overview';
import AdminApplicationsPage from './pages/admin/Applications';
import AdminCategoriesPage from './pages/admin/Categories';
import AdminUsersPage from './pages/admin/Users';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-[#0A0A0A] text-white">
            <Navbar />
            <main className="pt-navbar">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/category/:slug" element={<LeaderboardPage />} />
                <Route path="/profile/:handle" element={<ProfilePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/badges" element={<BadgesPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                {/* Admin routes */}
                <Route path="/admin/overview" element={<AdminOverviewPage />} />
                <Route path="/admin/applications" element={<AdminApplicationsPage />} />
                <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
              </Routes>
            </main>
            <Analytics />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
