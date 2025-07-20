import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format, addMinutes } from 'date-fns';

const CREATE_SCHEDULED_POST = gql`
  mutation CreateScheduledPost($input: CreateScheduledPostInput!) {
    createScheduledPost(input: $input) {
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

interface CreatePostFormData {
  title: string;
  content: string;
  scheduledFor: string;
  mediumApiToken: string;
}

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const [isPublishNow, setIsPublishNow] = useState(false);
  const [formData, setFormData] = useState<CreatePostFormData>({
    title: '',
    content: '',
    scheduledFor: '',
    mediumApiToken: ''
  });

  const [createPost, { loading }] = useMutation(CREATE_SCHEDULED_POST, {
    onCompleted: (data) => {
      const action = isPublishNow ? 'published' : 'scheduled';
      toast.success(`Post "${data.createScheduledPost.title}" ${action} successfully!`, {
        duration: 4000,
      });
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        scheduledFor: '',
        mediumApiToken: ''
      });
      
      // Navigate to posts list after a short delay
      setTimeout(() => {
        navigate('/posts');
      }, 1500);
    },
    onError: (error) => {
      const action = isPublishNow ? 'publish' : 'schedule';
      toast.error(`Failed to ${action} post: ${error.message}`, {
        duration: 5000,
      });
    },
    // Update the cache to include the new post
    update: (cache, { data }) => {
      if (data?.createScheduledPost) {
        const existingPosts = cache.readQuery({ query: GET_SCHEDULED_POSTS });
        if (existingPosts) {
          cache.writeQuery({
            query: GET_SCHEDULED_POSTS,
            data: {
              scheduledPosts: [data.createScheduledPost, ...existingPosts.scheduledPosts]
            }
          });
        }
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const action = isPublishNow ? 'Publishing' : 'Scheduling';
    const loadingToast = toast.loading(`${action} your post...`);
    
    try {
      // If publishing now, set scheduledFor to current time
      const scheduledFor = isPublishNow ? new Date().toISOString() : formData.scheduledFor;
      
      await createPost({
        variables: {
          input: {
            title: formData.title,
            content: formData.content,
            scheduledFor: scheduledFor,
            mediumApiToken: formData.mediumApiToken
          }
        }
      });
      
      toast.dismiss(loadingToast);
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error('Error creating post:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate minimum date (1 minute from now) in local timezone
  const getMinDateTime = () => {
    const now = new Date();
    const oneMinuteFromNow = addMinutes(now, 1);
    
    // Convert to local datetime string for the input field
    const year = oneMinuteFromNow.getFullYear();
    const month = String(oneMinuteFromNow.getMonth() + 1).padStart(2, '0');
    const day = String(oneMinuteFromNow.getDate()).padStart(2, '0');
    const hours = String(oneMinuteFromNow.getHours()).padStart(2, '0');
    const minutes = String(oneMinuteFromNow.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="form-container">
      <h2>Create a New Post</h2>

      {/* Publish Mode Toggle */}
      <div className="form-group">
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="publishMode"
              checked={!isPublishNow}
              onChange={() => setIsPublishNow(false)}
            />
            <span>Schedule for Later</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="publishMode"
              checked={isPublishNow}
              onChange={() => setIsPublishNow(true)}
            />
            <span>Publish Now</span>
          </label>
        </div>
        <small>
          {isPublishNow 
            ? 'The post will be published immediately to Medium.'
            : 'The post will be scheduled and published at the specified time.'
          }
        </small>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Post Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="Enter your post title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Post Content (Markdown)</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            required
            placeholder="Write your post content in Markdown format..."
          />
          <small>
            You can use Markdown formatting like **bold**, *italic*, # headings, and more.
          </small>
        </div>

        {!isPublishNow && (
          <div className="form-group">
            <label htmlFor="scheduledFor">Schedule For</label>
            <input
              type="datetime-local"
              id="scheduledFor"
              name="scheduledFor"
              value={formData.scheduledFor}
              onChange={handleInputChange}
              required
              min={getMinDateTime()}
            />
            <small>
              Choose when you want this post to be published to Medium (minimum 1 minute from now).
            </small>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="mediumApiToken">RapidAPI Key (Optional)</label>
          <input
            type="password"
            id="mediumApiToken"
            name="mediumApiToken"
            value={formData.mediumApiToken}
            onChange={handleInputChange}
            placeholder="Enter your RapidAPI key for Medium API access"
          />
          <small>
            <strong>Note:</strong> We're using the Unofficial Medium API via RapidAPI. 
            For now, posts are simulated. To get real API access, sign up at{' '}
            <a href="https://rapidapi.com/letscrape-6bRBa3QguO5/api/medium2" target="_blank" rel="noopener noreferrer">
              RapidAPI Medium API
            </a> and add your key to the backend environment variables.
          </small>
        </div>

        <button 
          type="submit" 
          className="btn-primary"
          disabled={loading}
        >
          {loading 
            ? (isPublishNow ? 'Publishing...' : 'Scheduling...') 
            : (isPublishNow ? 'Publish Now' : 'Schedule Post')
          }
        </button>
      </form>
    </div>
  );
};

export default CreatePost; 