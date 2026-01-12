import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContactTicket extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const ContactTicketSchema = new Schema<IContactTicket>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ContactTicketSchema.index({ status: 1, createdAt: -1 });
ContactTicketSchema.index({ email: 1 });

const ContactTicket: Model<IContactTicket> = 
  mongoose.models.ContactTicket || mongoose.model<IContactTicket>('ContactTicket', ContactTicketSchema);

export default ContactTicket;

