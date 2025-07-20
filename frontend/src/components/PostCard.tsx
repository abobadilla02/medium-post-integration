import React from 'react';
import { format, isValid, parseISO } from 'date-fns';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    scheduledFor: string;
    publishedAt?: string;
    status: 'pending' | 'published' | 'failed';
    mediumPostId?: string;
    createdAt: string;
  };
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
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

  return (
    <div className="post-card">
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
  );
};

export default PostCard; 