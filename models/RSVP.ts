import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRSVP extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: 'going' | 'interested' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const RSVPSchema = new Schema<IRSVP>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['going', 'interested', 'cancelled'],
      default: 'going',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one RSVP per user per event
RSVPSchema.index({ eventId: 1, userId: 1 }, { unique: true });
RSVPSchema.index({ userId: 1, status: 1, createdAt: -1 });

const RSVP: Model<IRSVP> = mongoose.models.RSVP || mongoose.model<IRSVP>('RSVP', RSVPSchema);

export default RSVP;

