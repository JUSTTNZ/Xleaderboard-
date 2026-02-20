import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import api from '../lib/api';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          console.error('Auth callback error:', error);
          navigate('/');
          return;
        }

        localStorage.setItem('supabase_token', session.access_token);

        await api.post('/auth/callback', {
          access_token: session.access_token,
        });

        navigate('/dashboard');
      } catch (error) {
        console.error('Callback processing error:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
      >
        <Loader2 size={40} className="text-white" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-body text-gray-400"
      >
        Signing you in...
      </motion.p>
    </div>
  );
}
