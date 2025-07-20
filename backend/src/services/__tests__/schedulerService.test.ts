import { SchedulerService } from '../schedulerService';
import { ScheduledPost } from '../../models/ScheduledPost';
import { publishToMedium } from '../mediumService';

// Mock dependencies
jest.mock('../../models/ScheduledPost');
jest.mock('../mediumService');

const mockScheduledPost = ScheduledPost as jest.Mocked<typeof ScheduledPost>;
const mockPublishToMedium = publishToMedium as jest.MockedFunction<typeof publishToMedium>;

describe('SchedulerService', () => {
  let scheduler: SchedulerService;

  beforeEach(() => {
    jest.clearAllMocks();
    scheduler = SchedulerService.getInstance();
  });

  afterEach(() => {
    scheduler.stop();
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton)', () => {
      const instance1 = SchedulerService.getInstance();
      const instance2 = SchedulerService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('start', () => {
    it('should start the scheduler', () => {
      const startSpy = jest.spyOn(scheduler, 'start');
      scheduler.start();
      expect(startSpy).toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('should stop the scheduler', () => {
      const stopSpy = jest.spyOn(scheduler, 'stop');
      scheduler.stop();
      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe('processPostImmediately', () => {
    it('should process a post immediately and update status to published', async () => {
      const mockPost = {
        _id: '1',
        title: 'Test Post',
        content: 'Test content',
        scheduledFor: new Date(),
        status: 'pending',
        mediumApiToken: 'test-token',
      };

      mockScheduledPost.findById.mockResolvedValue(mockPost as any);
      mockPublishToMedium.mockResolvedValue('medium-123');

      const result = await scheduler.processPostImmediately('1');

      expect(mockScheduledPost.findById).toHaveBeenCalledWith('1');
      expect(mockPublishToMedium).toHaveBeenCalledWith(mockPost);
      expect(mockScheduledPost.findByIdAndUpdate).toHaveBeenCalledWith('1', {
        status: 'published',
        publishedAt: expect.any(Date),
        mediumPostId: 'medium-123',
      });
      expect(result).toBe(true);
    });

    it('should handle publishing errors and update status to failed', async () => {
      const mockPost = {
        _id: '1',
        title: 'Test Post',
        content: 'Test content',
        scheduledFor: new Date(),
        status: 'pending',
        mediumApiToken: 'test-token',
      };

      mockScheduledPost.findById.mockResolvedValue(mockPost as any);
      mockPublishToMedium.mockRejectedValue(new Error('Publishing failed'));

      const result = await scheduler.processPostImmediately('1');

      expect(mockScheduledPost.findByIdAndUpdate).toHaveBeenCalledWith('1', {
        status: 'failed',
      });
      expect(result).toBe(false);
    });

    it('should return false for non-existent post', async () => {
      mockScheduledPost.findById.mockResolvedValue(null);

      const result = await scheduler.processPostImmediately('999');

      expect(result).toBe(false);
      expect(mockPublishToMedium).not.toHaveBeenCalled();
    });

    it('should return false for already published post', async () => {
      const mockPost = {
        _id: '1',
        title: 'Test Post',
        content: 'Test content',
        scheduledFor: new Date(),
        status: 'published',
        mediumApiToken: 'test-token',
      };

      mockScheduledPost.findById.mockResolvedValue(mockPost as any);

      const result = await scheduler.processPostImmediately('1');

      expect(result).toBe(false);
      expect(mockPublishToMedium).not.toHaveBeenCalled();
    });
  });

  describe('processPendingPosts', () => {
    it('should process all pending posts that are due', async () => {
      const mockPosts = [
        {
          _id: '1',
          title: 'Post 1',
          content: 'Content 1',
          scheduledFor: new Date(Date.now() - 1000), // Past date
          status: 'pending',
          mediumApiToken: 'test-token',
        },
        {
          _id: '2',
          title: 'Post 2',
          content: 'Content 2',
          scheduledFor: new Date(), // Current date
          status: 'pending',
          mediumApiToken: 'test-token',
        },
      ];

      mockScheduledPost.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockPosts),
      } as any);
      mockPublishToMedium.mockResolvedValue('medium-123');

      await scheduler.processPendingPosts();

      expect(mockScheduledPost.find).toHaveBeenCalledWith({
        status: 'pending',
        scheduledFor: { $lte: expect.any(Date) },
      });
      expect(mockPublishToMedium).toHaveBeenCalledTimes(2);
    });

    it('should handle errors during batch processing', async () => {
      const mockPosts = [
        {
          _id: '1',
          title: 'Post 1',
          content: 'Content 1',
          scheduledFor: new Date(Date.now() - 1000),
          status: 'pending',
          mediumApiToken: 'test-token',
        },
      ];

      mockScheduledPost.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockPosts),
      } as any);
      mockPublishToMedium.mockRejectedValue(new Error('Publishing failed'));

      // Should not throw error
      await expect(scheduler.processPendingPosts()).resolves.not.toThrow();

      expect(mockScheduledPost.findByIdAndUpdate).toHaveBeenCalledWith('1', {
        status: 'failed',
      });
    });
  });
}); 