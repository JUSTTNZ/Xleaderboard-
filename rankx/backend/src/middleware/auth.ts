import { Response, NextFunction } from 'express';
import supabase from '../config/supabase';
import User from '../models/User';
import { AuthenticatedRequest, OptionalAuthRequest } from '../types';

const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
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

    req.user = dbUser;
    next();
  } catch {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

const optionalAuth = async (req: OptionalAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    req.user = null;
    next();
    return;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (!error && user) {
      const dbUser = await User.findOne({ supabase_id: user.id });
      req.user = dbUser || null;
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }

  next();
};

export { authenticate, optionalAuth };
