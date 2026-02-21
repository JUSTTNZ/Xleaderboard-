import express, { Request, Response } from 'express';
import supabase from '../config/supabase';
import User from '../models/User';

const router = express.Router();

interface CallbackBody {
  access_token: string;
}

// POST /api/auth/callback - Handle OAuth callback, sync user to MongoDB
router.post('/callback', async (req: Request<Record<string, never>, unknown, CallbackBody>, res: Response): Promise<void> => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      res.status(400).json({ error: 'access_token is required' });
      return;
    }

    const { data: { user }, error } = await supabase.auth.getUser(access_token);
    if (error || !user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const meta = user.user_metadata || {};

    const handle = (meta.user_name as string) || (meta.preferred_username as string) || 'user';
    const ADMIN_HANDLES = ['codebynz'];

    const updateFields: Record<string, unknown> = {
      supabase_id: user.id,
      twitter_id: (meta.provider_id as string) || '',
      handle,
      display_name: (meta.full_name as string) || (meta.name as string) || 'User',
      avatar_url: (meta.avatar_url as string) || (meta.picture as string) || '',
      bio: (meta.description as string) || '',
      followers_count: (meta.followers_count as number) || 0,
      last_login: new Date(),
    };

    if (ADMIN_HANDLES.includes(handle.toLowerCase())) {
      updateFields.is_admin = true;
    }

    const dbUser = await User.findOneAndUpdate(
      { supabase_id: user.id },
      updateFields,
      { upsert: true, returnDocument: 'after' }
    );

    res.json({ success: true, user: dbUser });
  } catch (error) {
    console.error('Auth callback error:', error);
    res.status(500).json({ error: 'Auth callback failed' });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'No token' });
    return;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const dbUser = await User.findOne({ supabase_id: user.id });
    if (!dbUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ success: true, user: dbUser });
  } catch {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
