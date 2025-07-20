import mongoose, { Document, Schema } from 'mongoose';

export interface IScheduledPost extends Document {
  title: string;
  content: string;
  scheduledFor: Date;
  publishedAt?: Date;
  status: 'pending' | 'published' | 'failed';
  mediumPostId?: string;
  mediumApiToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduledPostSchema = new Schema<IScheduledPost>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  scheduledFor: {
    type: Date,
    required: true,
    index: true
  },
  publishedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'published', 'failed'],
    default: 'pending',
    index: true
  },
  mediumPostId: {
    type: String,
    default: null
  },
  mediumApiToken: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for id field
ScheduledPostSchema.virtual('id').get(function(this: any) {
  return this._id.toHexString();
});

// Index for efficient querying of pending posts
ScheduledPostSchema.index({ status: 1, scheduledFor: 1 });

export const ScheduledPost = mongoose.model<IScheduledPost>('ScheduledPost', ScheduledPostSchema); 