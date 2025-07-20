import React from 'react';
import { useQuery, gql, useSubscription } from '@apollo/client';
import { format, isValid, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const GET_SCHEDULED_POSTS = gql`
  query GetScheduledPosts {
    scheduledPosts {
      id
      title
      content
      scheduledFor
      publishedAt
      status
      mediumPostId
      createdAt
    }
  }
`;

const POST_STATUS_CHANGED = gql`
  subscription PostStatusChanged {
    postStatusChanged {
      id
      title
      content
      scheduledFor
      publishedAt
      status
      mediumPostId
      createdAt
    }
  }
`;

const POST_PUBLISHED = gql`
  subscription PostPublished {
    postPublished {
      id
      title
      content
      scheduledFor
      publishedAt
      status
      mediumPostId
      createdAt
    }
  }
`;

interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  scheduledFor: string;
  publishedAt?: string;
  status: 'pending' | 'published' | 'failed';
  mediumPostId?: string;
  createdAt: string;
}

const PostList: React.FC = () => {
  const { loading, error, data, refetch } = useQuery(GET_SCHEDULED_POSTS, {
    // Automatically refetch when the component mounts or when returning to this page
    fetchPolicy: 'cache-and-network',
    // Refetch every 30 seconds to check for status updates
    pollInterval: 30000,
    onError: (error) => {
      toast.error(`Failed to load posts: ${error.message}`, {
        duration: 5000,
      });
    }
  });

  // Subscribe to real-time status changes
  useSubscription(POST_STATUS_CHANGED, {
    onData: ({ data }) => {
      if (data?.data?.postStatusChanged) {
        const updatedPost = data.data.postStatusChanged;
        console.log('Post status changed:', updatedPost);
        
        // Show toast notification for status changes
        if (updatedPost.status === 'published') {
          toast.success(`Post "${updatedPost.title}" has been published!`, {
            duration: 4000,
          });
        } else if (updatedPost.status === 'failed') {
          toast.error(`Failed to publish post "${updatedPost.title}"`, {
            duration: 5000,
          });
        }
      }
    },
    onError: (error) => {
      console.error('Subscription error:', error);
    }
  });

  // Subscribe to post published events
  useSubscription(POST_PUBLISHED, {
    onData: ({ data }) => {
      if (data?.data?.postPublished) {
        const publishedPost = data.data.postPublished;
        console.log('Post published:', publishedPost);
        
        toast.success(`🎉 Post "${publishedPost.title}" is now live on Medium!`, {
          duration: 5000,
        });
      }
    },
    onError: (error) => {
      console.error('Publication subscription error:', error);
    }
  });

  if (loading && !data) return <div className="loading">Loading posts...</div>;
  if (error && !data) return <div className="error">Error loading posts: {error.message}</div>;

  const posts = data?.scheduledPosts || [];

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'published':
        return 'status-published';
      case 'failed':
        return 'status-failed';
      default:
        return '';
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    
    try {
      // Try parsing as ISO string first
      let date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'PPP p');
      }
      
      // If that fails, try creating a new Date object
      date = new Date(dateString);
      if (isValid(date)) {
        return format(date, 'PPP p');
      }
      
      return 'Invalid Date';
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return 'Invalid Date';
    }
  };

  const formatDateShort = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    
    try {
      // Try parsing as ISO string first
      let date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'PPP');
      }
      
      // If that fails, try creating a new Date object
      date = new Date(dateString);
      if (isValid(date)) {
        return format(date, 'PPP');
      }
      
      return 'Invalid Date';
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return 'Invalid Date';
    }
  };

  const handleRefresh = async () => {
    const loadingToast = toast.loading('Refreshing posts...');
    try {
      await refetch();
      toast.success('Posts refreshed successfully!', {
        duration: 2000,
      });
    } catch (error) {
      toast.error('Failed to refresh posts', {
        duration: 3000,
      });
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h2>Scheduled Posts</h2>
        <button onClick={handleRefresh} className="btn-primary" disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <h3>No posts scheduled yet</h3>
          <p>Create your first scheduled post to get started!</p>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post: ScheduledPost) => (
            <div key={post.id} className="post-card">
              <h3>{post.title || 'Untitled Post'}</h3>
              <p>{truncateContent(post.content)}</p>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <span className={`post-status ${getStatusClass(post.status)}`}>
                  {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </span>
              </div>

              <div className="post-meta">
                <div><strong>Scheduled for:</strong> {formatDate(post.scheduledFor)}</div>
                {post.publishedAt && (
                  <div><strong>Published at:</strong> {formatDate(post.publishedAt)}</div>
                )}
                {post.mediumPostId && (
                  <div><strong>Medium Post ID:</strong> {post.mediumPostId}</div>
                )}
                <div><strong>Created:</strong> {formatDateShort(post.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostList; 