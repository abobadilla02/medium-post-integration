# Testing Guide

This project uses a comprehensive testing strategy with Jest, React Testing Library, and Playwright for different types of tests.

## Testing Stack

- **Jest**: Unit and integration testing framework
- **React Testing Library**: Component testing with focus on user behavior
- **Playwright**: End-to-end testing across multiple browsers
- **MSW (Mock Service Worker)**: API mocking for frontend tests
- **MongoDB Memory Server**: In-memory MongoDB for backend tests
- **Supertest**: HTTP assertion library for API testing

## Test Structure

```
├── frontend/
│   ├── src/
│   │   ├── __tests__/           # App-level tests
│   │   ├── components/
│   │   │   └── __tests__/       # Component tests
│   │   ├── mocks/               # MSW handlers
│   │   └── setupTests.ts        # Jest setup
│   ├── e2e/                     # Playwright E2E tests
│   └── jest.config.js           # Jest configuration
├── backend/
│   ├── src/
│   │   ├── __tests__/           # API integration tests
│   │   ├── resolvers/
│   │   │   └── __tests__/       # Resolver unit tests
│   │   ├── services/
│   │   │   └── __tests__/       # Service unit tests
│   │   └── test/
│   │       └── setup.ts         # Test setup
│   └── jest.config.js           # Jest configuration
└── package.json                 # Root test scripts
```

## Running Tests

### Install Dependencies

First, install all dependencies including testing packages:

```bash
npm run install:all
```

### Frontend Tests

#### Unit and Integration Tests (Jest + React Testing Library)

```bash
# Run all frontend tests
npm run test:frontend

# Run tests in watch mode
npm run test:frontend:watch

# Run tests with coverage
npm run test:frontend:coverage
```

#### End-to-End Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (visible browser)
npm run test:e2e:headed
```

### Backend Tests

```bash
# Run all backend tests
npm run test:backend

# Run tests in watch mode
npm run test:backend:watch

# Run tests with coverage
npm run test:backend:coverage
```

### All Tests

```bash
# Run all tests (frontend + backend)
npm test
```

## Test Types

### Frontend Unit Tests

Located in `frontend/src/components/__tests__/` and `frontend/src/__tests__/`

- **Component Tests**: Test individual React components
- **Integration Tests**: Test component interactions
- **Hook Tests**: Test custom React hooks
- **Utility Tests**: Test utility functions

Example component test:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreatePost from '../CreatePost';

describe('CreatePost Component', () => {
  it('should render form fields', () => {
    render(<CreatePost />);
    expect(screen.getByLabelText('Post Title')).toBeInTheDocument();
  });
});
```

### Frontend E2E Tests

Located in `frontend/e2e/`

- **User Journey Tests**: Complete user workflows
- **Cross-browser Tests**: Test in Chrome, Firefox, Safari
- **Mobile Tests**: Test on mobile devices
- **API Integration**: Test with real API calls

Example E2E test:

```typescript
import { test, expect } from '@playwright/test';

test('should create a new post', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Post Title').fill('Test Post');
  await page.getByRole('button', { name: 'Create Post' }).click();
  await expect(page).toHaveURL('/posts');
});
```

### Backend Unit Tests

Located in `backend/src/resolvers/__tests__/` and `backend/src/services/__tests__/`

- **Resolver Tests**: Test GraphQL resolvers
- **Service Tests**: Test business logic
- **Model Tests**: Test database models

Example resolver test:

```typescript
import { resolvers } from '../index';

describe('GraphQL Resolvers', () => {
  it('should return all scheduled posts', async () => {
    const result = await resolvers.Query.scheduledPosts();
    expect(result).toBeInstanceOf(Array);
  });
});
```

### Backend Integration Tests

Located in `backend/src/__tests__/`

- **API Tests**: Test GraphQL endpoints
- **Database Tests**: Test with real database operations
- **Service Integration**: Test service interactions

Example integration test:

```typescript
import request from 'supertest';

describe('API Integration Tests', () => {
  it('should create a new post', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({ query: mutation, variables })
      .expect(200);
    
    expect(response.body.data.createScheduledPost).toBeDefined();
  });
});
```

## Test Configuration

### Jest Configuration

#### Frontend (`frontend/jest.config.js`)
- Uses `jsdom` environment for DOM testing
- Includes React Testing Library setup
- Configures coverage thresholds (70%)
- Mocks static assets and CSS modules

#### Backend (`backend/jest.config.js`)
- Uses Node.js environment
- Includes MongoDB Memory Server setup
- Configures coverage thresholds (70%)
- Sets longer timeout for database operations

### Playwright Configuration (`frontend/playwright.config.ts`)
- Tests multiple browsers (Chrome, Firefox, Safari)
- Includes mobile device testing
- Configures screenshot and trace capture
- Sets up development server

## Mocking Strategy

### Frontend Mocking (MSW)
- **GraphQL API**: Mock all GraphQL operations
- **HTTP Requests**: Mock external API calls
- **Service Workers**: Intercept network requests

### Backend Mocking (Jest)
- **External Services**: Mock Medium API calls
- **Database**: Use MongoDB Memory Server
- **Dependencies**: Mock scheduler service

## Coverage Requirements

The project enforces 70% coverage across:
- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

## Best Practices

### Writing Tests

1. **Test Behavior, Not Implementation**: Focus on what users see and do
2. **Use Descriptive Test Names**: Clear, readable test descriptions
3. **Follow AAA Pattern**: Arrange, Act, Assert
4. **Test Edge Cases**: Include error scenarios and boundary conditions
5. **Keep Tests Independent**: Each test should be self-contained

### Component Testing

```typescript
// Good: Test user interactions
test('should submit form when user clicks button', async () => {
  const user = userEvent.setup();
  render(<CreatePost />);
  
  await user.type(screen.getByLabelText('Title'), 'Test Post');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  
  expect(screen.getByText('Success')).toBeInTheDocument();
});

// Avoid: Testing implementation details
test('should call onSubmit with form data', () => {
  const mockSubmit = jest.fn();
  render(<CreatePost onSubmit={mockSubmit} />);
  // Implementation details...
});
```

### API Testing

```typescript
// Good: Test complete API responses
test('should return posts with correct structure', async () => {
  const response = await request(app)
    .post('/graphql')
    .send({ query: GET_POSTS });
  
  expect(response.body.data.scheduledPosts).toHaveLength(2);
  expect(response.body.data.scheduledPosts[0]).toHaveProperty('title');
});
```

## Debugging Tests

### Jest Debugging

```bash
# Run specific test file
npm test -- CreatePost.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should submit form"

# Debug with Node.js debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Playwright Debugging

```bash
# Run tests in headed mode
npm run test:e2e:headed

# Run specific test
npx playwright test create-post.spec.ts

# Debug with Playwright Inspector
npx playwright test --debug
```

## CI/CD Integration

The testing setup is designed to work with CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    npm run install:all
    npm test
    npm run test:e2e

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## Troubleshooting

### Common Issues

1. **MSW Not Working**: Ensure MSW is properly set up in `setupTests.ts`
2. **Database Connection**: Check MongoDB Memory Server configuration
3. **Playwright Timeouts**: Increase timeout values for slow operations
4. **Coverage Not Generated**: Verify Jest coverage configuration

### Performance Tips

1. **Parallel Testing**: Use Jest's parallel execution
2. **Test Isolation**: Clean up after each test
3. **Mock Heavy Operations**: Mock external API calls
4. **Selective Testing**: Use test patterns to run specific tests

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain coverage thresholds
4. Add E2E tests for user journeys
5. Update this documentation if needed 