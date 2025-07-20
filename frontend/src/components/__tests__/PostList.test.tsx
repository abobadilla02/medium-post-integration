import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import { Toaster } from 'react-hot-toast';
import PostList from '../PostList';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  ...jest.requireActual('react-hot-toast'),
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}));

// Mock the useQuery hook
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useQuery: jest.fn(),
  useSubscription: jest.fn(),
}));

const mockUseQuery = require('@apollo/client').useQuery;
const mockUseSubscription = require('@apollo/client').useSubscription;

const mockPosts = [
  {
    id: '1',
    title: 'Test Post 1',
    content: 'This is a test post content that should be truncated if it gets too long',
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
  {
    id: '3',
    title: 'Failed Post',
    content: 'This post failed to publish',
    scheduledFor: '2024-01-14T10:00:00.000Z',
    publishedAt: null,
    status: 'failed',
    mediumPostId: null,
    createdAt: '2024-01-14T09:00:00.000Z',
  },
];

const mockClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: {
    request: jest.fn(),
  } as any,
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ApolloProvider client={mockClient}>
      {component}
      <Toaster />
    </ApolloProvider>
  );
};

describe('PostList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSubscription.mockReturnValue({});
  });

  it('renders the post list header', () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { scheduledPosts: mockPosts },
      refetch: jest.fn(),
    });

    renderWithProviders(<PostList />);
    
    expect(screen.getByText('Scheduled Posts')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Refresh/i })).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    mockUseQuery.mockReturnValue({
      loading: true,
      error: null,
      data: null,
      refetch: jest.fn(),
    });

    renderWithProviders(<PostList />);
    
    expect(screen.getByText('Loading posts...')).toBeInTheDocument();
  });

  it('displays posts when data is loaded', async () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { scheduledPosts: mockPosts },
      refetch: jest.fn(),
    });

    renderWithProviders(<PostList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    });
  });

  it('shows empty state when no posts exist', async () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { scheduledPosts: [] },
      refetch: jest.fn(),
    });

    renderWithProviders(<PostList />);

    await waitFor(() => {
      expect(screen.getByText('No posts scheduled yet')).toBeInTheDocument();
      expect(screen.getByText('Create your first scheduled post to get started!')).toBeInTheDocument();
    });
  });

  it('displays post status correctly', async () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { scheduledPosts: mockPosts },
      refetch: jest.fn(),
    });

    renderWithProviders(<PostList />);
    
    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Published')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });
  });

  it('truncates long content', async () => {
    // Create a post with content longer than 150 characters to test truncation
    const longContentPost = {
      id: '5',
      title: 'Long Content Post',
      content: 'This is a very long post content that should definitely be truncated because it exceeds the maximum length of 150 characters. This content is designed to test the truncation functionality of the PostList component.',
      scheduledFor: '2024-01-18T10:00:00.000Z',
      publishedAt: null,
      status: 'pending',
      mediumPostId: null,
      createdAt: '2024-01-18T09:00:00.000Z',
    };

    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { scheduledPosts: [longContentPost] },
      refetch: jest.fn(),
    });

    renderWithProviders(<PostList />);
    
    await waitFor(() => {
      // Check that the content is displayed and truncated
      const contentElement = screen.getByText(/This is a very long post content/);
      expect(contentElement).toBeInTheDocument();
      
      // Check that the content ends with "..."
      const content = contentElement.textContent || '';
      expect(content).toMatch(/\.\.\.$/);
      
      // Check that the content is not longer than the expected truncated length
      expect(content.length).toBeLessThanOrEqual(153); // 150 + 3 for "..."
    });
  });

  it('formats dates correctly', async () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { scheduledPosts: mockPosts },
      refetch: jest.fn(),
    });

    renderWithProviders(<PostList />);
    
    await waitFor(() => {
      // Check that dates are formatted and displayed
      expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument();
      expect(screen.getByText(/January 16, 2024/)).toBeInTheDocument();
    });
  });

  it('shows Medium Post ID when available', async () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { scheduledPosts: mockPosts },
      refetch: jest.fn(),
    });

    renderWithProviders(<PostList />);
    
    await waitFor(() => {
      // Check that Medium Post ID label exists
      const mediumIdLabels = screen.getAllByText(/Medium Post ID:/);
      expect(mediumIdLabels).toHaveLength(1);
      
      // Check that the actual Medium Post ID value is displayed
      expect(screen.getByText('medium-123')).toBeInTheDocument();
    });
  });

  it('handles refresh button click', async () => {
    const mockRefetch = jest.fn();
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { scheduledPosts: mockPosts },
      refetch: mockRefetch,
    });

    const user = userEvent.setup();
    renderWithProviders(<PostList />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Refresh/i })).toBeInTheDocument();
    });
    
    const refreshButton = screen.getByRole('button', { name: /Refresh/i });
    await user.click(refreshButton);
    
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('applies correct CSS classes for status', async () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { scheduledPosts: mockPosts },
      refetch: jest.fn(),
    });

    renderWithProviders(<PostList />);
    
    await waitFor(() => {
      // Get all status elements by their specific class
      const statusElements = document.querySelectorAll('.post-status');
      
      // Check that we have the expected number of status elements
      expect(statusElements).toHaveLength(3);
      
      // Check that each status has the correct class
      const pendingStatus = screen.getByText('Pending').closest('.post-status');
      const publishedStatus = screen.getByText('Published').closest('.post-status');
      const failedStatus = screen.getByText('Failed').closest('.post-status');
      
      expect(pendingStatus).toHaveClass('status-pending');
      expect(publishedStatus).toHaveClass('status-published');
      expect(failedStatus).toHaveClass('status-failed');
    });
  });

  it('displays post metadata correctly', async () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { scheduledPosts: mockPosts },
      refetch: jest.fn(),
    });

    renderWithProviders(<PostList />);
    
    await waitFor(() => {
      // Check that metadata labels exist (using getAllByText to handle multiple instances)
      const scheduledLabels = screen.getAllByText(/Scheduled for:/);
      const publishedLabels = screen.getAllByText(/Published at:/);
      const createdLabels = screen.getAllByText(/Created:/);
      const mediumIdLabels = screen.getAllByText(/Medium Post ID:/);
      
      // Should have 3 posts, so 3 instances of each label
      expect(scheduledLabels).toHaveLength(3);
      expect(createdLabels).toHaveLength(3);
      expect(publishedLabels).toHaveLength(1); // Only one post is published
      expect(mediumIdLabels).toHaveLength(1); // Only one post has Medium ID
    });
  });

  it('handles posts without titles', async () => {
    const untitledPosts = [
      {
        id: '4',
        title: '',
        content: 'Content without title',
        scheduledFor: '2024-01-17T10:00:00.000Z',
        publishedAt: null,
        status: 'pending',
        mediumPostId: null,
        createdAt: '2024-01-17T09:00:00.000Z',
      },
    ];

    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { scheduledPosts: untitledPosts },
      refetch: jest.fn(),
    });

    renderWithProviders(<PostList />);
    
    await waitFor(() => {
      expect(screen.getByText('Untitled Post')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: new Error('Failed to fetch posts'),
      data: null,
      refetch: jest.fn(),
    });

    renderWithProviders(<PostList />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading posts/)).toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', async () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { scheduledPosts: mockPosts },
      refetch: jest.fn(),
    });

    renderWithProviders(<PostList />);
    
    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /Refresh/i });
      expect(refreshButton).toBeInTheDocument();
      
      // Check that posts are in a grid layout
      const postsGrid = document.querySelector('.posts-grid');
      expect(postsGrid).toBeInTheDocument();
    });
  });
}); 