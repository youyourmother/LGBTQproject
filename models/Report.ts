import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReport extends Document {
  targetType: 'event' | 'comment' | 'user';
  targetId: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId;
  reason: string;
  status: 'open' | 'reviewed' | 'dismissed';
  moderatorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    targetType: {
      type: String,
      enum: ['event', 'comment', 'user'],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType',
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['open', 'reviewed', 'dismissed'],
      default: 'open',
    },
    moderatorNotes: {
      type: String,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ targetType: 1, targetId: 1 });
ReportSchema.index({ reporterId: 1 });

const Report: Model<IReport> = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);

export default Report;

