import type { Meta, StoryObj } from '@storybook/react';
import PostCard from './PostCard';

const meta: Meta<typeof PostCard> = {
  title: 'Components/PostCard',
  component: PostCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    post: {
      control: 'object',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = {
  args: {
    post: {
      id: '1',
      title: 'Sample Post Title',
      content: 'This is a sample post content that will be published to Medium.',
      scheduledFor: '2024-01-15T10:00:00Z',
      status: 'pending',
      createdAt: '2024-01-10T09:00:00Z',
    },
  },
};

export const Published: Story = {
  args: {
    post: {
      id: '2',
      title: 'Published Post',
      content: 'This post has been successfully published to Medium.',
      scheduledFor: '2024-01-15T10:00:00Z',
      publishedAt: '2024-01-15T10:00:00Z',
      status: 'published',
      mediumPostId: 'medium-post-123',
      createdAt: '2024-01-10T09:00:00Z',
    },
  },
};

export const Failed: Story = {
  args: {
    post: {
      id: '3',
      title: 'Failed Post',
      content: 'This post failed to publish to Medium.',
      scheduledFor: '2024-01-15T10:00:00Z',
      status: 'failed',
      createdAt: '2024-01-10T09:00:00Z',
    },
  },
}; 