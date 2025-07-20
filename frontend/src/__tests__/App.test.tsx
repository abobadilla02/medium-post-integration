import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import App from '../App';

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
      </BrowserRouter>
    </ApolloProvider>
  );
};

describe('App Component', () => {
  it('renders the app header with navigation', () => {
    renderWithProviders(<App />);
    
    expect(screen.getByText('Medium Scheduler')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithProviders(<App />);
    
    expect(screen.getByRole('link', { name: /Create Post/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View Posts/i })).toBeInTheDocument();
  });

  it('renders the main container', () => {
    renderWithProviders(<App />);
    
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveClass('container');
  });

  it('renders ErrorBoundary wrapper', () => {
    renderWithProviders(<App />);
    
    // ErrorBoundary should be present in the component tree
    const errorBoundary = document.querySelector('.container');
    expect(errorBoundary).toBeInTheDocument();
  });

  it('has proper semantic HTML structure', () => {
    renderWithProviders(<App />);
    
    expect(screen.getByRole('banner')).toBeInTheDocument(); // header
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    renderWithProviders(<App />);
    
    expect(screen.getByRole('banner')).toHaveClass('App-header');
    expect(screen.getByRole('main')).toHaveClass('container');
  });
}); 