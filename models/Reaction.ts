import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReaction extends Document {
  commentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  emoji: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReactionSchema = new Schema<IReaction>(
  {
    commentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    emoji: {
      type: String,
      required: true,
      maxlength: 10,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one reaction per user per comment per emoji
ReactionSchema.index({ commentId: 1, userId: 1, emoji: 1 }, { unique: true });

const Reaction: Model<IReaction> = mongoose.models.Reaction || mongoose.model<IReaction>('Reaction', ReactionSchema);

export default Reaction;

