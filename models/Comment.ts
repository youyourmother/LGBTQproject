import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
  eventId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId;
  body: string;
  editedAt?: Date;
  status: 'visible' | 'flagged' | 'removed';
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    body: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    editedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['visible', 'flagged', 'removed'],
      default: 'visible',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CommentSchema.index({ eventId: 1, status: 1, createdAt: -1 });
CommentSchema.index({ authorId: 1 });
CommentSchema.index({ parentId: 1 });

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;

