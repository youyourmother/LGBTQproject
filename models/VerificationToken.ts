import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVerificationToken extends Document {
  email: string;
  token: string;
  type: 'email' | 'password';
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationTokenSchema = new Schema<IVerificationToken>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    token: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['email', 'password'],
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (single definition to avoid duplicate index warning)
VerificationTokenSchema.index({ token: 1 }, { unique: true });
VerificationTokenSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

const VerificationToken: Model<IVerificationToken> = 
  mongoose.models.VerificationToken || mongoose.model<IVerificationToken>('VerificationToken', VerificationTokenSchema);

export default VerificationToken;

