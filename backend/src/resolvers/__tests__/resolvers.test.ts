import { resolvers } from '../index';
import { ScheduledPost } from '../../models/ScheduledPost';
import { SchedulerService } from '../../services/schedulerService';
import { publishToMedium } from '../../services/mediumService';

// Mock dependencies
jest.mock('../../models/ScheduledPost');
jest.mock('../../services/schedulerService');
jest.mock('../../services/mediumService');

const mockScheduledPost = ScheduledPost as jest.Mocked<typeof ScheduledPost>;
const mockSchedulerService = SchedulerService as jest.MockedClass<typeof SchedulerService>;
const mockPublishToMedium = publishToMedium as jest.MockedFunction<typeof publishToMedium>;

describe('GraphQL Resolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query resolvers', () => {
    describe('scheduledPosts', () => {
      it('should return all scheduled posts sorted by creation date', async () => {
        const mockPosts = [
          {
            _id: '1',
            title: 'Test Post 1',
            content: 'Content 1',
            scheduledFor: new Date('2024-01-15T10:00:00Z'),
            status: 'pending',
            createdAt: new Date('2024-01-15T09:00:00Z'),
            toObject: () => ({
              _id: '1',
              title: 'Test Post 1',
              content: 'Content 1',
              scheduledFor: new Date('2024-01-15T10:00:00Z'),
              status: 'pending',
              createdAt: new Date('2024-01-15T09:00:00Z'),
            }),
          },
        ];

        mockScheduledPost.find.mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockPosts),
        } as any);

        const result = await resolvers.Query.scheduledPosts();

        expect(mockScheduledPost.find).toHaveBeenCalled();
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('id', '1');
        expect(result[0]).toHaveProperty('scheduledFor', '2024-01-15T10:00:00.000Z');
      });
    });

    describe('scheduledPost', () => {
      it('should return a specific post by id', async () => {
        const mockPost = {
          _id: '1',
          title: 'Test Post',
          content: 'Content',
          scheduledFor: new Date('2024-01-15T10:00:00Z'),
          status: 'pending',
          toObject: () => ({
            _id: '1',
            title: 'Test Post',
            content: 'Content',
            scheduledFor: new Date('2024-01-15T10:00:00Z'),
            status: 'pending',
          }),
        };

        mockScheduledPost.findById.mockResolvedValue(mockPost as any);

        const result = await resolvers.Query.scheduledPost(null, { id: '1' });

        expect(mockScheduledPost.findById).toHaveBeenCalledWith('1');
        expect(result).toHaveProperty('id', '1');
        expect(result).toHaveProperty('title', 'Test Post');
      });

      it('should return null for non-existent post', async () => {
        mockScheduledPost.findById.mockResolvedValue(null);

        const result = await resolvers.Query.scheduledPost(null, { id: '999' });

        expect(result).toBeNull();
      });
    });

    describe('pendingPosts', () => {
      it('should return pending posts scheduled for past or present', async () => {
        const mockPosts = [
          {
            _id: '1',
            title: 'Pending Post',
            content: 'Content',
            scheduledFor: new Date('2024-01-15T10:00:00Z'),
            status: 'pending',
            toObject: () => ({
              _id: '1',
              title: 'Pending Post',
              content: 'Content',
              scheduledFor: new Date('2024-01-15T10:00:00Z'),
              status: 'pending',
            }),
          },
        ];

        mockScheduledPost.find.mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockPosts),
        } as any);

        const result = await resolvers.Query.pendingPosts();

        expect(mockScheduledPost.find).toHaveBeenCalledWith({
          status: 'pending',
          scheduledFor: { $lte: expect.any(Date) },
        });
        expect(result).toHaveLength(1);
      });
    });
  });

  describe('Mutation resolvers', () => {
    describe('createScheduledPost', () => {
      it('should create a new scheduled post', async () => {
        const input = {
          title: 'New Post',
          content: 'New content',
          scheduledFor: '2024-12-25T10:00:00Z',
          mediumApiToken: 'test-token',
        };

        const mockPost = {
          _id: '1',
          ...input,
          scheduledFor: new Date(input.scheduledFor),
          status: 'pending',
          save: jest.fn().mockResolvedValue({
            _id: '1',
            ...input,
            scheduledFor: new Date(input.scheduledFor),
            status: 'pending',
          }),
          toObject: () => ({
            _id: '1',
            ...input,
            scheduledFor: new Date(input.scheduledFor),
            status: 'pending',
          }),
        };

        mockScheduledPost.mockImplementation(() => mockPost as any);

        const result = await resolvers.Mutation.createScheduledPost(null, { input });

        expect(mockScheduledPost).toHaveBeenCalledWith({
          title: 'New Post',
          content: 'New content',
          scheduledFor: new Date('2024-12-25T10:00:00Z'),
          mediumApiToken: 'test-token',
        });
        expect(result).toHaveProperty('id', '1');
        expect(result).toHaveProperty('title', 'New Post');
      });

      it('should publish post immediately if scheduled for past', async () => {
        const pastDate = new Date();
        pastDate.setMinutes(pastDate.getMinutes() - 10);

        const input = {
          title: 'Past Post',
          content: 'Content',
          scheduledFor: pastDate.toISOString(),
          mediumApiToken: 'test-token',
        };

        const mockPost = {
          _id: '1',
          ...input,
          scheduledFor: pastDate,
          status: 'pending',
          save: jest.fn().mockResolvedValue({
            _id: '1',
            ...input,
            scheduledFor: pastDate,
            status: 'pending',
          }),
          toObject: () => ({
            _id: '1',
            ...input,
            scheduledFor: pastDate,
            status: 'pending',
          }),
        };

        const mockUpdatedPost = {
          _id: '1',
          ...input,
          scheduledFor: pastDate,
          status: 'published',
          toObject: () => ({
            _id: '1',
            ...input,
            scheduledFor: pastDate,
            status: 'published',
          }),
        };

        mockScheduledPost.mockImplementation(() => mockPost as any);
        mockScheduledPost.findById.mockResolvedValue(mockUpdatedPost as any);

        const mockSchedulerInstance = {
          processPostImmediately: jest.fn().mockResolvedValue(true),
        };
        mockSchedulerService.getInstance.mockReturnValue(mockSchedulerInstance as any);

        const result = await resolvers.Mutation.createScheduledPost(null, { input });

        expect(mockSchedulerInstance.processPostImmediately).toHaveBeenCalledWith('1');
        expect(result).toHaveProperty('status', 'published');
      });
    });

    describe('updateScheduledPost', () => {
      it('should update an existing post', async () => {
        const updateInput = {
          title: 'Updated Title',
          content: 'Updated content',
        };

        const mockUpdatedPost = {
          _id: '1',
          title: 'Updated Title',
          content: 'Updated content',
          scheduledFor: new Date('2024-12-25T10:00:00Z'),
          status: 'pending',
          toObject: () => ({
            _id: '1',
            title: 'Updated Title',
            content: 'Updated content',
            scheduledFor: new Date('2024-12-25T10:00:00Z'),
            status: 'pending',
          }),
        };

        mockScheduledPost.findByIdAndUpdate.mockResolvedValue(mockUpdatedPost as any);

        const result = await resolvers.Mutation.updateScheduledPost(null, {
          id: '1',
          input: updateInput,
        });

        expect(mockScheduledPost.findByIdAndUpdate).toHaveBeenCalledWith(
          '1',
          updateInput,
          { new: true }
        );
        expect(result).toHaveProperty('title', 'Updated Title');
      });

      it('should return null for non-existent post', async () => {
        mockScheduledPost.findByIdAndUpdate.mockResolvedValue(null);

        const result = await resolvers.Mutation.updateScheduledPost(null, {
          id: '999',
          input: { title: 'Updated' },
        });

        expect(result).toBeNull();
      });
    });

    describe('deleteScheduledPost', () => {
      it('should delete a post and return true', async () => {
        mockScheduledPost.findByIdAndDelete.mockResolvedValue({ _id: '1' } as any);

        const result = await resolvers.Mutation.deleteScheduledPost(null, { id: '1' });

        expect(mockScheduledPost.findByIdAndDelete).toHaveBeenCalledWith('1');
        expect(result).toBe(true);
      });

      it('should return false for non-existent post', async () => {
        mockScheduledPost.findByIdAndDelete.mockResolvedValue(null);

        const result = await resolvers.Mutation.deleteScheduledPost(null, { id: '999' });

        expect(result).toBe(false);
      });
    });

    describe('publishPost', () => {
      it('should publish a post successfully', async () => {
        const mockPost = {
          _id: '1',
          title: 'Test Post',
          content: 'Content',
          scheduledFor: new Date('2024-01-15T10:00:00Z'),
          status: 'pending',
        };

        const mockUpdatedPost = {
          _id: '1',
          title: 'Test Post',
          content: 'Content',
          scheduledFor: new Date('2024-01-15T10:00:00Z'),
          status: 'published',
          publishedAt: new Date(),
          mediumPostId: 'medium-123',
          toObject: () => ({
            _id: '1',
            title: 'Test Post',
            content: 'Content',
            scheduledFor: new Date('2024-01-15T10:00:00Z'),
            status: 'published',
            publishedAt: new Date(),
            mediumPostId: 'medium-123',
          }),
        };

        mockScheduledPost.findById.mockResolvedValue(mockPost as any);
        mockScheduledPost.findByIdAndUpdate.mockResolvedValue(mockUpdatedPost as any);
        mockPublishToMedium.mockResolvedValue('medium-123');

        const result = await resolvers.Mutation.publishPost(null, { id: '1' });

        expect(mockPublishToMedium).toHaveBeenCalledWith(mockPost);
        expect(result).toHaveProperty('status', 'published');
        expect(result).toHaveProperty('mediumPostId', 'medium-123');
      });

      it('should handle publishing errors', async () => {
        const mockPost = {
          _id: '1',
          title: 'Test Post',
          content: 'Content',
          scheduledFor: new Date('2024-01-15T10:00:00Z'),
          status: 'pending',
        };

        mockScheduledPost.findById.mockResolvedValue(mockPost as any);
        mockPublishToMedium.mockRejectedValue(new Error('Publishing failed'));

        await expect(
          resolvers.Mutation.publishPost(null, { id: '1' })
        ).rejects.toThrow('Publishing failed');

        expect(mockScheduledPost.findByIdAndUpdate).toHaveBeenCalledWith('1', {
          status: 'failed',
        });
      });

      it('should throw error for non-existent post', async () => {
        mockScheduledPost.findById.mockResolvedValue(null);

        await expect(
          resolvers.Mutation.publishPost(null, { id: '999' })
        ).rejects.toThrow('Post not found');
      });
    });
  });
}); 