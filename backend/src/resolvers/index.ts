import { ScheduledPost, IScheduledPost } from '../models/ScheduledPost';
import { publishToMedium } from '../services/mediumService';
import { SchedulerService } from '../services/schedulerService';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

// Helper function to serialize dates for GraphQL
const serializeDates = (post: any) => {
  if (!post) return post;
  
  // Convert MongoDB document to plain object
  const postObj = post.toObject ? post.toObject() : post;
  
  return {
    ...postObj,
    id: postObj._id || postObj.id, // Ensure id field is present
    scheduledFor: postObj.scheduledFor?.toISOString(),
    publishedAt: postObj.publishedAt?.toISOString(),
    createdAt: postObj.createdAt?.toISOString(),
    updatedAt: postObj.updatedAt?.toISOString(),
    mediumPostId: postObj.mediumPostId || null // Ensure mediumPostId is always present
  };
};

export const resolvers = {
  Query: {
    scheduledPosts: async (): Promise<IScheduledPost[]> => {
      const posts = await ScheduledPost.find().sort({ createdAt: -1 });
      return posts.map(serializeDates);
    },
    
    scheduledPost: async (_: any, { id }: { id: string }): Promise<IScheduledPost | null> => {
      const post = await ScheduledPost.findById(id);
      return post ? serializeDates(post) : null;
    },
    
    pendingPosts: async (): Promise<IScheduledPost[]> => {
      const posts = await ScheduledPost.find({ 
        status: 'pending',
        scheduledFor: { $lte: new Date() }
      }).sort({ scheduledFor: 1 });
      return posts.map(serializeDates);
    }
  },

  Mutation: {
    createScheduledPost: async (_: any, { input }: { input: any }): Promise<IScheduledPost> => {
      const { title, content, scheduledFor, mediumApiToken } = input;
      
      const scheduledPost = new ScheduledPost({
        title,
        content,
        scheduledFor: new Date(scheduledFor),
        mediumApiToken
      });
      
      const savedPost = await scheduledPost.save();
      
      // If the post is scheduled for now or in the past, publish it immediately
      const scheduledDate = new Date(scheduledFor);
      const now = new Date();
      if (scheduledDate <= now) {
        const scheduler = SchedulerService.getInstance();
        await scheduler.processPostImmediately((savedPost as any)._id.toString());
        
        // Refetch the post to get updated status
        const updatedPost = await ScheduledPost.findById((savedPost as any)._id);
        return updatedPost ? serializeDates(updatedPost) : serializeDates(savedPost);
      }
      
      return serializeDates(savedPost);
    },

    updateScheduledPost: async (_: any, { id, input }: { id: string; input: any }): Promise<IScheduledPost | null> => {
      const updateData: any = {};
      
      if (input.title) updateData.title = input.title;
      if (input.content) updateData.content = input.content;
      if (input.scheduledFor) updateData.scheduledFor = new Date(input.scheduledFor);
      if (input.status) updateData.status = input.status;
      
      const updatedPost = await ScheduledPost.findByIdAndUpdate(id, updateData, { new: true });
      return updatedPost ? serializeDates(updatedPost) : null;
    },

    deleteScheduledPost: async (_: any, { id }: { id: string }): Promise<boolean> => {
      const result = await ScheduledPost.findByIdAndDelete(id);
      return !!result;
    },

    publishPost: async (_: any, { id }: { id: string }): Promise<IScheduledPost | null> => {
      const post = await ScheduledPost.findById(id);
      if (!post) {
        throw new Error('Post not found');
      }

      try {
        const mediumPostId = await publishToMedium(post);
        
        const updatedPost = await ScheduledPost.findByIdAndUpdate(id, {
          status: 'published',
          publishedAt: new Date(),
          mediumPostId
        }, { new: true });
        
        if (updatedPost) {
          const serializedPost = serializeDates(updatedPost);
          pubsub.publish('POST_STATUS_CHANGED', { postStatusChanged: serializedPost });
          pubsub.publish('POST_PUBLISHED', { postPublished: serializedPost });
        }
        
        return updatedPost ? serializeDates(updatedPost) : null;
      } catch (error) {
        await ScheduledPost.findByIdAndUpdate(id, {
          status: 'failed'
        });
        throw error;
      }
    },

    publishPostNow: async (_: any, { id }: { id: string }): Promise<IScheduledPost | null> => {
      const post = await ScheduledPost.findById(id);
      if (!post) {
        throw new Error('Post not found');
      }

      const scheduler = SchedulerService.getInstance();
      const success = await scheduler.processPostImmediately(id);
      
      if (!success) {
        throw new Error('Failed to publish post immediately');
      }

      const updatedPost = await ScheduledPost.findById(id);
      if (updatedPost) {
        const serializedPost = serializeDates(updatedPost);
        pubsub.publish('POST_STATUS_CHANGED', { postStatusChanged: serializedPost });
        pubsub.publish('POST_PUBLISHED', { postPublished: serializedPost });
      }
      
      return updatedPost ? serializeDates(updatedPost) : null;
    },

    updatePostStatus: async (_: any, { id, status, mediumPostId, publishedAt }: { id: string; status: string; mediumPostId?: string; publishedAt?: string }): Promise<IScheduledPost | null> => {
      const updateData: any = { status };
      
      if (mediumPostId) updateData.mediumPostId = mediumPostId;
      if (publishedAt) updateData.publishedAt = new Date(publishedAt);
      
      const updatedPost = await ScheduledPost.findByIdAndUpdate(id, updateData, { new: true });
      
      if (updatedPost) {
        const serializedPost = serializeDates(updatedPost);
        pubsub.publish('POST_STATUS_CHANGED', { postStatusChanged: serializedPost });
        
        if (status === 'published') {
          pubsub.publish('POST_PUBLISHED', { postPublished: serializedPost });
        }
      }
      
      return updatedPost ? serializeDates(updatedPost) : null;
    }
  },

  Subscription: {
    postStatusChanged: {
      subscribe: () => pubsub.asyncIterator(['POST_STATUS_CHANGED'])
    },
    postPublished: {
      subscribe: () => pubsub.asyncIterator(['POST_PUBLISHED'])
    }
  }
}; 