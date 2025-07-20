import { setupServer } from 'msw/node';
import { graphql, http, HttpResponse } from 'msw';

interface CreateScheduledPostInput {
  title: string;
  content: string;
  scheduledFor: string;
  mediumApiToken?: string;
}

interface GraphQLVariables {
  input: CreateScheduledPostInput;
}

const handlers = [
  // GraphQL endpoint
  graphql.query('GetScheduledPosts', () => {
    return HttpResponse.json({
      data: {
        scheduledPosts: [
          {
            id: '1',
            title: 'Test Post 1',
            content: 'This is a test post content',
            scheduledFor: '2024-01-15T10:00:00.000Z',
            publishedAt: null,
            status: 'pending',
            mediumPostId: null,
            createdAt: '2024-01-15T09:00:00.000Z',
          },
          {
            id: '2',
            title: 'Test Post 2',
            content: 'This is another test post content',
            scheduledFor: '2024-01-16T10:00:00.000Z',
            publishedAt: '2024-01-16T10:00:00.000Z',
            status: 'published',
            mediumPostId: 'medium-123',
            createdAt: '2024-01-15T11:00:00.000Z',
          },
        ],
      },
    });
  }),

  graphql.mutation('CreateScheduledPost', ({ variables }: { variables: GraphQLVariables }) => {
    const { input } = variables;
    return HttpResponse.json({
      data: {
        createScheduledPost: {
          id: '3',
          title: input.title,
          content: input.content,
          scheduledFor: input.scheduledFor,
          publishedAt: null,
          status: 'pending',
          mediumPostId: null,
          createdAt: new Date().toISOString(),
        },
      },
    });
  }),

  // Health check endpoint
  http.get('/health', () => {
    return HttpResponse.json({ status: 'OK', timestamp: new Date().toISOString() });
  }),
];

export const server = setupServer(...handlers); 