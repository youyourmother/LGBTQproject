import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  displayName?: string;
  email: string;
  emailVerified?: Date;
  password?: string;
  pronouns?: string;
  avatarUrl?: string;
  role: 'member' | 'org_admin' | 'moderator' | 'admin';
  orgIds: mongoose.Types.ObjectId[];
  settings: {
    emailOptIn: boolean;
    profileVisibility: 'public' | 'members' | 'private';
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    emailVerified: {
      type: Date,
    },
    password: {
      type: String,
      select: false, // Don't return password by default
    },
    pronouns: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
    },
    role: {
      type: String,
      enum: ['member', 'org_admin', 'moderator', 'admin'],
      default: 'member',
    },
    orgIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    }],
    settings: {
      emailOptIn: {
        type: Boolean,
        default: true,
      },
      profileVisibility: {
        type: String,
        enum: ['public', 'members', 'private'],
        default: 'public',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ role: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

