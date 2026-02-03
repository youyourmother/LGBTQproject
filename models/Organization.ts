import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  description?: string;
  verified: boolean;
  owners: mongoose.Types.ObjectId[];
  members: mongoose.Types.ObjectId[];
  tags: string[];
  locationCenter?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: {
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
    description: {
      type: String,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    owners: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }],
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    tags: [{
      type: String,
      trim: true,
    }],
    locationCenter: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
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
  },
  {
    timestamps: true,
  }
);

// Indexes (single definition for slug to avoid duplicate index warning)
OrganizationSchema.index({ slug: 1 }, { unique: true });
OrganizationSchema.index({ verified: 1 });
OrganizationSchema.index({ locationCenter: '2dsphere' });

const Organization: Model<IOrganization> = 
  mongoose.models.Organization || mongoose.model<IOrganization>('Organization', OrganizationSchema);

export default Organization;

