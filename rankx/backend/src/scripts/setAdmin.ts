import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User';

async function setAdminUser(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ handle: { $regex: /^codebynz$/i } });

    if (!user) {
      console.log('User @codebynz not found in database');
      console.log('User must sign in with Twitter first to create account');
      process.exit(1);
    }

    user.is_admin = true;
    await user.save();

    console.log('Successfully set @codebynz as admin');
    console.log('User ID:', user._id);
    console.log('Handle:', user.handle);
    console.log('Display Name:', user.display_name);
    console.log('Is Admin:', user.is_admin);

    process.exit(0);
  } catch (error) {
    console.error('Error setting admin:', error);
    process.exit(1);
  }
}

setAdminUser();
