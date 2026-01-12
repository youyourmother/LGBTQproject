import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';
import User from '@/models/User';
import { z } from 'zod';

const createOrgSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(1000),
  tags: z.array(z.string()).optional(),
});

// Helper to generate unique slug
async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);

  let slug = baseSlug;
  let counter = 1;

  while (await Organization.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// POST - Create organization
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!session.user.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email before creating organizations' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input
    const validation = createOrgSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, description, tags } = validation.data;

    await dbConnect();

    // Generate unique slug
    const slug = await generateUniqueSlug(name);

    // Create organization
    const org = await Organization.create({
      name,
      slug,
      description,
      tags: tags || [],
      verified: false,
      owners: [session.user.id],
      members: [session.user.id],
    });

    // Update user to add org_admin role and add org to orgIds
    await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { orgIds: org._id },
      $set: { role: 'org_admin' },
    });

    return NextResponse.json({
      message: 'Organization created successfully',
      slug: org.slug,
      orgId: org._id,
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}

