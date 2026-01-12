// Load environment variables FIRST before any other imports
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import dbConnect from '../lib/mongodb';
import User from '../models/User';
import VerificationToken from '../models/VerificationToken';

async function verifyUser(email: string) {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Connected!');

    // Find the user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      process.exit(1);
    }

    console.log(`\n✓ Found user: ${user.name} (${user.email})`);

    // Check if already verified
    if (user.emailVerified) {
      console.log('✓ Email is already verified!');
      console.log(`  Verified at: ${user.emailVerified}`);
      process.exit(0);
    }

    // Find verification token
    const token = await VerificationToken.findOne({
      email: email.toLowerCase(),
      type: 'email',
    });

    if (token) {
      console.log('\n📧 Verification Token Found:');
      console.log(`  Token: ${token.token}`);
      console.log(`  Expires: ${token.expires}`);
      console.log(`\n🔗 Verification URL:`);
      console.log(`  ${process.env.NEXTAUTH_URL}/auth/verify?token=${token.token}`);
      console.log('\n');
    }

    // Verify the user automatically
    console.log('Verifying user automatically...');
    user.emailVerified = new Date();
    await user.save();
    console.log('✅ User email verified successfully!');

    // Delete the token
    if (token) {
      await VerificationToken.deleteOne({ _id: token._id });
      console.log('✓ Verification token deleted');
    }

    console.log('\n🎉 Done! You can now sign in with your account.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get email from command line
const email = process.argv[2] || 'yuymott@gmail.com';
verifyUser(email);

