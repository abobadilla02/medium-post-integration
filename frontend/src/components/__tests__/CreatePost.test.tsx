import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import { Toaster } from 'react-hot-toast';
import CreatePost from '../CreatePost';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

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

// Mock the useMutation hook
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useMutation: jest.fn(),
}));

const mockUseMutation = require('@apollo/client').useMutation;

const mockClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: {
    request: jest.fn(),
  } as any,
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ApolloProvider client={mockClient}>
      <BrowserRouter>
        {component}
        <Toaster />
      </BrowserRouter>
    </ApolloProvider>
  );
};

describe('CreatePost Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMutation.mockReturnValue([
      jest.fn(),
      { loading: false, error: null }
    ]);
  });

  it('renders the create post form', () => {
    renderWithProviders(<CreatePost />);
    
    expect(screen.getByText('Create a New Post')).toBeInTheDocument();
    expect(screen.getByLabelText(/Post Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Post Content/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Schedule For/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/RapidAPI Key/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Post/i })).toBeInTheDocument();
  });

  it('shows schedule mode by default', () => {
    renderWithProviders(<CreatePost />);
    
    const scheduleRadio = screen.getByLabelText(/Schedule for Later/i);
    const publishRadio = screen.getByLabelText(/Publish Now/i);
    
    expect(scheduleRadio).toBeChecked();
    expect(publishRadio).not.toBeChecked();
    expect(screen.getByLabelText(/Schedule For/i)).toBeVisible();
  });

  it('switches to publish now mode when selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreatePost />);
    
    const publishRadio = screen.getByLabelText(/Publish Now/i);
    await user.click(publishRadio);
    
    expect(publishRadio).toBeChecked();
    expect(screen.getByLabelText(/Schedule For/i)).not.toBeVisible();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreatePost />);
    
    const submitButton = screen.getByRole('button', { name: /Create Post/i });
    await user.click(submitButton);
    
    // HTML5 validation should prevent form submission
    expect(screen.getByLabelText(/Post Title/i)).toBeRequired();
    expect(screen.getByLabelText(/Post Content/i)).toBeRequired();
    expect(screen.getByLabelText(/Schedule For/i)).toBeRequired();
  });

  it('updates form fields when user types', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreatePost />);
    
    const titleInput = screen.getByLabelText(/Post Title/i);
    const contentInput = screen.getByLabelText(/Post Content/i);
    
    await user.type(titleInput, 'Test Post Title');
    await user.type(contentInput, 'Test post content');
    
    expect(titleInput).toHaveValue('Test Post Title');
    expect(contentInput).toHaveValue('Test post content');
  });

  it('sets minimum datetime for scheduling', () => {
    renderWithProviders(<CreatePost />);
    
    const scheduleInput = screen.getByLabelText(/Schedule For/i);
    const minValue = scheduleInput.getAttribute('min');
    
    expect(minValue).toBeTruthy();
    expect(new Date(minValue!)).toBeInstanceOf(Date);
  });

  it('shows appropriate help text for each mode', () => {
    renderWithProviders(<CreatePost />);
    
    // Schedule mode help text
    expect(screen.getByText(/The post will be scheduled and published at the specified time/i)).toBeInTheDocument();
    
    // Switch to publish mode
    const publishRadio = screen.getByLabelText(/Publish Now/i);
    fireEvent.click(publishRadio);
    
    // Publish mode help text
    expect(screen.getByText(/The post will be published immediately to Medium/i)).toBeInTheDocument();
  });

  it('displays markdown help text', () => {
    renderWithProviders(<CreatePost />);
    
    expect(screen.getByText(/You can use Markdown formatting like \*\*bold\*\*, \*italic\*, # headings, and more/i)).toBeInTheDocument();
  });

  it('shows RapidAPI key information', () => {
    renderWithProviders(<CreatePost />);
    
    expect(screen.getByText(/We're using the Unofficial Medium API via RapidAPI/i)).toBeInTheDocument();
    expect(screen.getByText(/For now, posts are simulated/i)).toBeInTheDocument();
  });

  it('has proper form structure and accessibility', () => {
    renderWithProviders(<CreatePost />);
    
    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();
    
    // Check that labels are properly associated with inputs
    const titleInput = screen.getByLabelText(/Post Title/i);
    const contentInput = screen.getByLabelText(/Post Content/i);
    const scheduleInput = screen.getByLabelText(/Schedule For/i);
    const apiKeyInput = screen.getByLabelText(/RapidAPI Key/i);
    
    expect(titleInput).toHaveAttribute('id', 'title');
    expect(contentInput).toHaveAttribute('id', 'content');
    expect(scheduleInput).toHaveAttribute('id', 'scheduledFor');
    expect(apiKeyInput).toHaveAttribute('id', 'mediumApiToken');
  });

  it('handles form submission with valid data', async () => {
    const mockMutation = jest.fn();
    mockUseMutation.mockReturnValue([
      mockMutation,
      { loading: false, error: null }
    ]);

    const user = userEvent.setup();
    renderWithProviders(<CreatePost />);
    
    // Fill out the form
    await user.type(screen.getByLabelText(/Post Title/i), 'Test Post');
    await user.type(screen.getByLabelText(/Post Content/i), 'Test content');
    await user.type(screen.getByLabelText(/Schedule For/i), '2024-12-25T10:00');
    await user.type(screen.getByLabelText(/RapidAPI Key/i), 'test-api-key');
    
    const submitButton = screen.getByRole('button', { name: /Create Post/i });
    await user.click(submitButton);
    
    // The form should submit
    expect(mockMutation).toHaveBeenCalled();
  });

  it('disables submit button when loading', () => {
    mockUseMutation.mockReturnValue([
      jest.fn(),
      { loading: true, error: null }
    ]);

    renderWithProviders(<CreatePost />);
    
    const submitButton = screen.getByRole('button', { name: /Create Post/i });
    expect(submitButton).toBeDisabled();
  });
}); 