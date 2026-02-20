import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import api from '../lib/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithTwitter: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          localStorage.setItem('supabase_token', session.access_token);
          const { data } = await api.get('/auth/me');
          setUser(data.user);
        }
      } catch (error) {
        console.error('Session error:', error);
        localStorage.removeItem('supabase_token');
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          localStorage.setItem('supabase_token', session.access_token);
          try {
            const { data } = await api.post('/auth/callback', {
              access_token: session.access_token,
            });
            setUser(data.user);
          } catch (error) {
            console.error('Auth callback error:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('supabase_token');
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          localStorage.setItem('supabase_token', session.access_token);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithTwitter = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'x',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    });
    if (error) console.error('Sign in error:', error);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('supabase_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithTwitter, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
