/**
 * Database Seed Script
 * Run with: npx ts-node scripts/seed.ts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import dbConnect from '../lib/mongodb';
import User from '../models/User';
import Organization from '../models/Organization';
import Event from '../models/Event';
import Comment from '../models/Comment';
import RSVP from '../models/RSVP';

dotenv.config({ path: '.env.local' });

const ADMIN_SEED_USER = process.env.ADMIN_SEED_USER || 'testyu';
const ADMIN_SEED_EMAIL = process.env.ADMIN_SEED_EMAIL || 'admin@example.com';
const ADMIN_SEED_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'ChangeMe_Once';

async function seed() {
  try {
    await dbConnect();

    console.log('🌱 Starting database seed...');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Event.deleteMany({});
    await Comment.deleteMany({});
    await RSVP.deleteMany({});

    // Create admin user
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash(ADMIN_SEED_PASSWORD, 12);
    const adminUser = await User.create({
      name: ADMIN_SEED_USER,
      email: ADMIN_SEED_EMAIL,
      password: hashedPassword,
      emailVerified: new Date(),
      role: 'admin',
      pronouns: 'they/them',
      settings: {
        emailOptIn: true,
        profileVisibility: 'public',
      },
    });

    console.log(`✅ Admin user created: ${adminUser.email}`);

    // Create sample users
    console.log('Creating sample users...');
    const users = await User.create([
      {
        name: 'Alex Rivera',
        email: 'alex@example.com',
        password: await bcrypt.hash('password123', 12),
        emailVerified: new Date(),
        role: 'member',
        pronouns: 'she/her',
        settings: { emailOptIn: true, profileVisibility: 'public' },
      },
      {
        name: 'Jordan Chen',
        email: 'jordan@example.com',
        password: await bcrypt.hash('password123', 12),
        emailVerified: new Date(),
        role: 'org_admin',
        pronouns: 'they/them',
        settings: { emailOptIn: true, profileVisibility: 'public' },
      },
      {
        name: 'Sam Taylor',
        email: 'sam@example.com',
        password: await bcrypt.hash('password123', 12),
        emailVerified: new Date(),
        role: 'member',
        pronouns: 'he/him',
        settings: { emailOptIn: true, profileVisibility: 'public' },
      },
    ]);

    console.log(`✅ Created ${users.length} sample users`);

    // Create organizations
    console.log('Creating organizations...');
    const orgs = await Organization.create([
      {
        name: 'Pride Community Center',
        slug: 'pride-community-center',
        description: 'A welcoming space for LGBTQ+ individuals and allies',
        verified: true,
        owners: [users[1]._id],
        members: [users[1]._id, users[0]._id],
        tags: ['community', 'support', 'resources'],
        locationCenter: {
          type: 'Point',
          coordinates: [-83.0458, 42.3314], // Detroit coordinates
        },
      },
      {
        name: 'Queer Book Club',
        slug: 'queer-book-club',
        description: 'Monthly book discussions featuring LGBTQ+ authors and themes',
        verified: true,
        owners: [users[2]._id],
        members: [users[2]._id],
        tags: ['books', 'literature', 'discussion'],
      },
      {
        name: 'Trans Support Network',
        slug: 'trans-support-network',
        description: 'Peer support and resources for trans and non-binary individuals',
        verified: true,
        owners: [adminUser._id],
        members: [adminUser._id],
        tags: ['support', 'trans', 'community'],
      },
    ]);

    console.log(`✅ Created ${orgs.length} organizations`);

    // Create events
    console.log('Creating events...');
    const now = new Date();
    const events = await Event.create([
      {
        title: 'Pride Month Kickoff Party',
        slug: 'pride-month-kickoff-party',
        organizerType: 'organization',
        organizerId: orgs[0]._id,
        startsAt: new Date(now.getFullYear(), now.getMonth() + 1, 1, 18, 0),
        endsAt: new Date(now.getFullYear(), now.getMonth() + 1, 1, 22, 0),
        timezone: 'America/Detroit',
        location: {
          placeId: 'ChIJSWYi9lzLJIgR3MJX8L5L0T4',
          formattedAddress: '123 Rainbow St, Detroit, MI 48201',
          geo: {
            type: 'Point',
            coordinates: [-83.0458, 42.3314],
          },
        },
        types: ['social', 'celebration'],
        tags: ['pride', 'party', 'community'],
        shortDescription: 'Join us to celebrate the start of Pride Month with food, music, and community!',
        longDescription: 'Kick off Pride Month with an unforgettable celebration! Enjoy live music, delicious food from local vendors, and connect with the LGBTQ+ community. All ages welcome.',
        accessibility: {
          asl: true,
          stepFree: true,
          notes: 'ASL interpreter available, wheelchair accessible venue',
        },
        capacity: 200,
        rsvpMode: 'on_platform',
        visibility: 'public',
        status: 'active',
      },
      {
        title: 'Queer Book Club: "Stone Butch Blues"',
        slug: 'queer-book-club-stone-butch-blues',
        organizerType: 'organization',
        organizerId: orgs[1]._id,
        startsAt: new Date(now.getFullYear(), now.getMonth(), 15, 19, 0),
        endsAt: new Date(now.getFullYear(), now.getMonth(), 15, 21, 0),
        timezone: 'America/Detroit',
        location: {
          placeId: 'ChIJSWYi9lzLJIgR3MJX8L5L0T5',
          formattedAddress: '456 Book Lane, Ann Arbor, MI 48104',
          geo: {
            type: 'Point',
            coordinates: [-83.7430, 42.2808],
          },
        },
        types: ['education', 'social'],
        tags: ['books', 'literature', 'discussion'],
        shortDescription: 'This month we\'re reading Leslie Feinberg\'s groundbreaking novel',
        longDescription: 'Join us for an engaging discussion of "Stone Butch Blues" by Leslie Feinberg. This powerful novel explores gender identity, working-class life, and LGBTQ+ history. Light refreshments provided.',
        accessibility: {
          asl: false,
          stepFree: true,
        },
        capacity: 25,
        rsvpMode: 'on_platform',
        visibility: 'public',
        status: 'active',
      },
      {
        title: 'Trans Youth Support Group',
        slug: 'trans-youth-support-group',
        organizerType: 'organization',
        organizerId: orgs[2]._id,
        startsAt: new Date(now.getFullYear(), now.getMonth(), 20, 17, 0),
        endsAt: new Date(now.getFullYear(), now.getMonth(), 20, 19, 0),
        timezone: 'America/Detroit',
        location: {
          placeId: 'ChIJSWYi9lzLJIgR3MJX8L5L0T6',
          formattedAddress: '789 Support Ave, Detroit, MI 48202',
          geo: {
            type: 'Point',
            coordinates: [-83.0456, 42.3315],
          },
          roomNotes: 'Enter through side door, Room 204',
        },
        types: ['support', 'community'],
        tags: ['trans', 'youth', 'support'],
        shortDescription: 'Safe space for trans and non-binary youth (ages 13-18)',
        longDescription: 'A confidential peer support group for trans and non-binary young people. Facilitated by trained volunteers. Snacks provided. Parent/guardian consent required for first-time attendees.',
        accessibility: {
          asl: false,
          stepFree: true,
          quietRoom: true,
          notes: 'Sensory-friendly space available',
        },
        rsvpMode: 'on_platform',
        visibility: 'public',
        status: 'active',
      },
      {
        title: 'LGBTQ+ Trivia Night',
        slug: 'lgbtq-trivia-night',
        organizerType: 'individual',
        organizerId: users[0]._id,
        startsAt: new Date(now.getFullYear(), now.getMonth(), 25, 20, 0),
        endsAt: new Date(now.getFullYear(), now.getMonth(), 25, 23, 0),
        timezone: 'America/Detroit',
        location: {
          placeId: 'ChIJSWYi9lzLJIgR3MJX8L5L0T7',
          formattedAddress: 'The Rainbow Lounge, 321 Pride Blvd, Detroit, MI 48203',
          geo: {
            type: 'Point',
            coordinates: [-83.0460, 42.3316],
          },
        },
        types: ['social', 'entertainment'],
        tags: ['trivia', 'fun', 'bar'],
        shortDescription: 'Test your LGBTQ+ history and pop culture knowledge!',
        longDescription: 'Grab your friends and join us for a fun night of queer trivia! Categories include LGBTQ+ history, pop culture, and more. Prizes for the winning team!',
        accessibility: {
          asl: false,
          stepFree: false,
        },
        capacity: 60,
        rsvpMode: 'on_platform',
        visibility: 'public',
        status: 'active',
      },
      {
        title: 'Coming Out Support Workshop',
        slug: 'coming-out-support-workshop',
        organizerType: 'organization',
        organizerId: orgs[0]._id,
        startsAt: new Date(now.getFullYear(), now.getMonth() + 1, 5, 14, 0),
        endsAt: new Date(now.getFullYear(), now.getMonth() + 1, 5, 16, 30),
        timezone: 'America/Detroit',
        location: {
          placeId: 'ChIJSWYi9lzLJIgR3MJX8L5L0T8',
          formattedAddress: '123 Rainbow St, Detroit, MI 48201',
          geo: {
            type: 'Point',
            coordinates: [-83.0458, 42.3314],
          },
        },
        types: ['education', 'support'],
        tags: ['coming-out', 'support', 'workshop'],
        shortDescription: 'A supportive workshop for those considering coming out',
        longDescription: 'This workshop provides information, resources, and support for individuals considering coming out. Led by experienced facilitators. All identities welcome.',
        accessibility: {
          asl: true,
          stepFree: true,
        },
        capacity: 30,
        rsvpMode: 'on_platform',
        visibility: 'public',
        status: 'active',
      },
    ]);

    console.log(`✅ Created ${events.length} events`);

    // Create RSVPs
    console.log('Creating RSVPs...');
    await RSVP.create([
      { eventId: events[0]._id, userId: users[0]._id, status: 'going' },
      { eventId: events[0]._id, userId: users[1]._id, status: 'going' },
      { eventId: events[1]._id, userId: users[2]._id, status: 'going' },
      { eventId: events[2]._id, userId: adminUser._id, status: 'going' },
      { eventId: events[3]._id, userId: users[1]._id, status: 'interested' },
    ]);

    // Update event RSVP counts
    await Event.updateOne({ _id: events[0]._id }, { $set: { 'metrics.rsvps': 2 } });
    await Event.updateOne({ _id: events[1]._id }, { $set: { 'metrics.rsvps': 1 } });
    await Event.updateOne({ _id: events[2]._id }, { $set: { 'metrics.rsvps': 1 } });

    console.log('✅ Created RSVPs');

    // Create sample comments
    console.log('Creating comments...');
    const comments = await Comment.create([
      {
        eventId: events[0]._id,
        authorId: users[0]._id,
        body: 'So excited for this! Can\'t wait to celebrate with everyone! 🏳️‍🌈',
        status: 'visible',
      },
      {
        eventId: events[0]._id,
        authorId: users[1]._id,
        body: 'This is going to be amazing! Thanks for organizing!',
        status: 'visible',
      },
    ]);

    // Create a reply
    await Comment.create({
      eventId: events[0]._id,
      authorId: adminUser._id,
      parentId: comments[0]._id,
      body: 'We\'re excited to have you there!',
      status: 'visible',
    });

    console.log('✅ Created comments');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Admin credentials:');
    console.log(`   Email: ${ADMIN_SEED_EMAIL}`);
    console.log(`   Password: ${ADMIN_SEED_PASSWORD}`);
    console.log('\n📝 Sample user credentials:');
    console.log('   Email: alex@example.com, jordan@example.com, sam@example.com');
    console.log('   Password: password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();

