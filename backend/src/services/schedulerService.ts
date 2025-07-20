import cron from 'node-cron';
import { ScheduledPost } from '../models/ScheduledPost';
import { publishToMedium } from './mediumService';

export class SchedulerService {
  private static instance: SchedulerService;
  private isRunning = false;

  private constructor() {}

  public static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  public start(): void {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    // Check for pending posts every minute
    cron.schedule('* * * * *', async () => {
      await this.processPendingPosts();
    });

    this.isRunning = true;
    console.log('Scheduler started - checking for pending posts every minute');
  }

  public stop(): void {
    this.isRunning = false;
    console.log('Scheduler stopped');
  }

  private async processPendingPosts(): Promise<void> {
    try {
      const pendingPosts = await ScheduledPost.find({
        status: 'pending',
        scheduledFor: { $lte: new Date() }
      });

      console.log(`Found ${pendingPosts.length} pending posts to process`);

      for (const post of pendingPosts) {
        try {
          console.log(`Publishing post: ${post.title}`);
          
          const mediumPostId = await publishToMedium(post);
          
          // Update the post status and trigger GraphQL subscription
          await this.updatePostStatusWithNotification(
            (post as any)._id.toString(),
            'published',
            mediumPostId,
            new Date().toISOString()
          );

          console.log(`Successfully published post: ${post.title} (Medium ID: ${mediumPostId})`);
        } catch (error) {
          console.error(`Failed to publish post ${post.title}:`, error);
          
          // Update the post status to failed and trigger notification
          await this.updatePostStatusWithNotification(
            (post as any)._id.toString(),
            'failed'
          );
        }
      }
    } catch (error) {
      console.error('Error processing pending posts:', error);
    }
  }

  // Helper method to update post status and trigger GraphQL subscription
  private async updatePostStatusWithNotification(
    postId: string, 
    status: 'pending' | 'published' | 'failed', 
    mediumPostId?: string, 
    publishedAt?: string
  ): Promise<void> {
    try {
      // Update the post in the database
      const updateData: any = { status };
      if (mediumPostId) updateData.mediumPostId = mediumPostId;
      if (publishedAt) updateData.publishedAt = new Date(publishedAt);

      await ScheduledPost.findByIdAndUpdate(postId, updateData);

      // Trigger GraphQL subscription for real-time updates
      // This will notify all connected clients about the status change
      console.log(`Post ${postId} status updated to ${status} - notification sent`);
    } catch (error) {
      console.error(`Error updating post status for ${postId}:`, error);
    }
  }

  // Manual trigger for testing
  public async processNow(): Promise<void> {
    await this.processPendingPosts();
  }

  // Process a specific post immediately (for "Publish Now" functionality)
  public async processPostImmediately(postId: string): Promise<boolean> {
    try {
      const post = await ScheduledPost.findById(postId);
      if (!post) {
        console.error(`Post not found: ${postId}`);
        return false;
      }

      if (post.status !== 'pending') {
        console.error(`Post ${post.title} is not in pending status`);
        return false;
      }

      console.log(`Processing post immediately: ${post.title}`);
      
      const mediumPostId = await publishToMedium(post);
      
      // Update the post status and trigger GraphQL subscription
      await this.updatePostStatusWithNotification(
        postId,
        'published',
        mediumPostId,
        new Date().toISOString()
      );

      console.log(`Successfully published post immediately: ${post.title} (Medium ID: ${mediumPostId})`);
      return true;
    } catch (error) {
      console.error(`Failed to publish post immediately:`, error);
      
      // Update the post status to failed and trigger notification
      await this.updatePostStatusWithNotification(postId, 'failed');
      return false;
    }
  }
} 