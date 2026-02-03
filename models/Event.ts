import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  slug: string;
  organizerType: 'individual' | 'organization';
  organizerId: mongoose.Types.ObjectId;
  startsAt: Date;
  endsAt: Date;
  timezone: string;
  location: {
    placeId: string;
    formattedAddress: string;
    geo: {
      type: 'Point';
      coordinates: [number, number]; // [longitude, latitude]
    };
    roomNotes?: string;
  };
  types: string[];
  tags: string[];
  shortDescription: string;
  longDescription?: string;
  accessibility: {
    asl: boolean;
    stepFree: boolean;
    quietRoom?: boolean;
    notes?: string;
  };
  coverImageUrl?: string;
  capacity?: number;
  rsvpMode: 'external' | 'on_platform';
  rsvpUrl?: string;
  visibility: 'public' | 'unlisted';
  metrics: {
    views: number;
    rsvps: number;
    saves: number;
  };
  status: 'active' | 'flagged' | 'removed';
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    organizerType: {
      type: String,
      enum: ['individual', 'organization'],
      required: true,
    },
    organizerId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'organizerType',
    },
    startsAt: {
      type: Date,
      required: true,
      index: true,
    },
    endsAt: {
      type: Date,
      required: true,
    },
    timezone: {
      type: String,
      required: true,
      default: 'America/Detroit',
    },
    location: {
      placeId: {
        type: String,
        required: true,
      },
      formattedAddress: {
        type: String,
        required: true,
      },
      geo: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
          required: true,
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
          validate: {
            validator: function(v: number[]) {
              return v.length === 2 && 
                     v[0] >= -180 && v[0] <= 180 && 
                     v[1] >= -90 && v[1] <= 90;
            },
            message: 'Invalid coordinates',
          },
        },
      },
      roomNotes: String,
    },
    types: [{
      type: String,
      trim: true,
    }],
    tags: [{
      type: String,
      trim: true,
    }],
    shortDescription: {
      type: String,
      required: true,
      maxlength: 280,
    },
    longDescription: {
      type: String,
      maxlength: 5000,
    },
    accessibility: {
      asl: {
        type: Boolean,
        default: false,
      },
      stepFree: {
        type: Boolean,
        default: false,
      },
      quietRoom: Boolean,
      notes: String,
    },
    coverImageUrl: String,
    capacity: {
      type: Number,
      min: 1,
    },
    rsvpMode: {
      type: String,
      enum: ['external', 'on_platform'],
      default: 'on_platform',
    },
    rsvpUrl: String,
    visibility: {
      type: String,
      enum: ['public', 'unlisted'],
      default: 'public',
    },
    metrics: {
      views: {
        type: Number,
        default: 0,
      },
      rsvps: {
        type: Number,
        default: 0,
      },
      saves: {
        type: Number,
        default: 0,
      },
    },
    status: {
      type: String,
      enum: ['active', 'flagged', 'removed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search and filtering (single definition for slug to avoid duplicate index warning)
EventSchema.index({ slug: 1 }, { unique: true });
EventSchema.index({ 'location.geo': '2dsphere' });
EventSchema.index({ startsAt: 1, status: 1 });
EventSchema.index({ status: 1, visibility: 1, startsAt: 1 });
EventSchema.index({ tags: 1 });
EventSchema.index({ types: 1 });
EventSchema.index({ title: 'text', shortDescription: 'text', longDescription: 'text' });

const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;

