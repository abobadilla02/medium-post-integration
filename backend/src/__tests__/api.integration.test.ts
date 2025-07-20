import request from 'supertest';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from '../schema/typeDefs';
import { resolvers } from '../resolvers';
import { ScheduledPost } from '../models/ScheduledPost';

// Mock the scheduler service
jest.mock('../services/schedulerService', () => ({
  SchedulerService: {
    getInstance: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      processPostImmediately: jest.fn(),
    })),
  },
}));

describe('API Integration Tests', () => {
  let app: express.Application;
  let server: ApolloServer;

  beforeAll(async () => {
    // Create Express app
    app = express();
    app.use(express.json());

    // Create Apollo Server
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    server = new ApolloServer({
      schema,
      context: ({ req }) => ({ req }),
    });

    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });
  });

  afterAll(async () => {
    await server.stop();
  });

  beforeEach(async () => {
    // Clear all posts before each test
    await ScheduledPost.deleteMany({});
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GraphQL API', () => {
    describe('Query: scheduledPosts', () => {
      it('should return empty array when no posts exist', async () => {
        const query = `
          query {
            scheduledPosts {
              id
              title
              content
              status
            }
          }
        `;

        const response = await request(app)
          .post('/graphql')
          .send({ query })
          .expect(200);

        expect(response.body.data.scheduledPosts).toEqual([]);
      });

      it('should return all scheduled posts', async () => {
        // Create test posts
        const post1 = new ScheduledPost({
          title: 'Test Post 1',
          content: 'Content 1',
          scheduledFor: new Date('2024-12-25T10:00:00Z'),
          mediumApiToken: 'test-token',
        });
        const post2 = new ScheduledPost({
          title: 'Test Post 2',
          content: 'Content 2',
          scheduledFor: new Date('2024-12-26T10:00:00Z'),
          mediumApiToken: 'test-token',
        });

        await post1.save();
        await post2.save();

        const query = `
          query {
            scheduledPosts {
              id
              title
              content
              status
              scheduledFor
            }
          }
        `;

        const response = await request(app)
          .post('/graphql')
          .send({ query })
          .expect(200);

        expect(response.body.data.scheduledPosts).toHaveLength(2);
        expect(response.body.data.scheduledPosts[0]).toHaveProperty('title');
        expect(response.body.data.scheduledPosts[0]).toHaveProperty('content');
        expect(response.body.data.scheduledPosts[0]).toHaveProperty('status', 'pending');
      });
    });

    describe('Query: scheduledPost', () => {
      it('should return a specific post by id', async () => {
        const post = new ScheduledPost({
          title: 'Test Post',
          content: 'Test content',
          scheduledFor: new Date('2024-12-25T10:00:00Z'),
          mediumApiToken: 'test-token',
        });
        await post.save();

        const query = `
          query GetPost($id: ID!) {
            scheduledPost(id: $id) {
              id
              title
              content
              status
            }
          }
        `;

        const response = await request(app)
          .post('/graphql')
          .send({
            query,
            variables: { id: post._id.toString() },
          })
          .expect(200);

        expect(response.body.data.scheduledPost).toHaveProperty('title', 'Test Post');
        expect(response.body.data.scheduledPost).toHaveProperty('content', 'Test content');
      });

      it('should return null for non-existent post', async () => {
        const query = `
          query GetPost($id: ID!) {
            scheduledPost(id: $id) {
              id
              title
            }
          }
        `;

        const response = await request(app)
          .post('/graphql')
          .send({
            query,
            variables: { id: '507f1f77bcf86cd799439011' }, // Non-existent ObjectId
          })
          .expect(200);

        expect(response.body.data.scheduledPost).toBeNull();
      });
    });

    describe('Mutation: createScheduledPost', () => {
      it('should create a new scheduled post', async () => {
        const mutation = `
          mutation CreatePost($input: CreateScheduledPostInput!) {
            createScheduledPost(input: $input) {
              id
              title
              content
              status
              scheduledFor
            }
          }
        `;

        const variables = {
          input: {
            title: 'New Post',
            content: 'New content',
            scheduledFor: '2024-12-25T10:00:00Z',
            mediumApiToken: 'test-token',
          },
        };

        const response = await request(app)
          .post('/graphql')
          .send({ query: mutation, variables })
          .expect(200);

        expect(response.body.data.createScheduledPost).toHaveProperty('title', 'New Post');
        expect(response.body.data.createScheduledPost).toHaveProperty('content', 'New content');
        expect(response.body.data.createScheduledPost).toHaveProperty('status', 'pending');

        // Verify post was saved to database
        const savedPost = await ScheduledPost.findById(response.body.data.createScheduledPost.id);
        expect(savedPost).toBeTruthy();
        expect(savedPost?.title).toBe('New Post');
      });

      it('should validate required fields', async () => {
        const mutation = `
          mutation CreatePost($input: CreateScheduledPostInput!) {
            createScheduledPost(input: $input) {
              id
              title
            }
          }
        `;

        const variables = {
          input: {
            title: '', // Empty title
            content: 'Content',
            scheduledFor: '2024-12-25T10:00:00Z',
            mediumApiToken: 'test-token',
          },
        };

        const response = await request(app)
          .post('/graphql')
          .send({ query: mutation, variables })
          .expect(200);

        expect(response.body.errors).toBeDefined();
      });
    });

    describe('Mutation: updateScheduledPost', () => {
      it('should update an existing post', async () => {
        const post = new ScheduledPost({
          title: 'Original Title',
          content: 'Original content',
          scheduledFor: new Date('2024-12-25T10:00:00Z'),
          mediumApiToken: 'test-token',
        });
        await post.save();

        const mutation = `
          mutation UpdatePost($id: ID!, $input: UpdateScheduledPostInput!) {
            updateScheduledPost(id: $id, input: $input) {
              id
              title
              content
            }
          }
        `;

        const variables = {
          id: post._id.toString(),
          input: {
            title: 'Updated Title',
            content: 'Updated content',
          },
        };

        const response = await request(app)
          .post('/graphql')
          .send({ query: mutation, variables })
          .expect(200);

        expect(response.body.data.updateScheduledPost).toHaveProperty('title', 'Updated Title');
        expect(response.body.data.updateScheduledPost).toHaveProperty('content', 'Updated content');
      });
    });

    describe('Mutation: deleteScheduledPost', () => {
      it('should delete a post', async () => {
        const post = new ScheduledPost({
          title: 'To Delete',
          content: 'Content to delete',
          scheduledFor: new Date('2024-12-25T10:00:00Z'),
          mediumApiToken: 'test-token',
        });
        await post.save();

        const mutation = `
          mutation DeletePost($id: ID!) {
            deleteScheduledPost(id: $id)
          }
        `;

        const response = await request(app)
          .post('/graphql')
          .send({
            query: mutation,
            variables: { id: post._id.toString() },
          })
          .expect(200);

        expect(response.body.data.deleteScheduledPost).toBe(true);

        // Verify post was deleted from database
        const deletedPost = await ScheduledPost.findById(post._id);
        expect(deletedPost).toBeNull();
      });
    });
  });
}); 