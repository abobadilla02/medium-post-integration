# Medium Scheduler App

A fullstack web application for scheduling and publishing posts to Medium using React, TypeScript, GraphQL, and Node.js.

## 🚀 Features

- **Post Creation**: Write posts with Markdown support
- **Flexible Scheduling**: Schedule posts for any time (minimum 1 minute in the future)
- **Immediate Publishing**: Option to publish posts right away
- **Real-time Updates**: Live status updates when posts are published
- **Modern UI**: Responsive design with toast notifications
- **GraphQL API**: Type-safe API with subscriptions for real-time updates

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Apollo Client** for GraphQL
- **React Router** for navigation
- **React Hot Toast** for notifications
- **Date-fns** for date handling
- **CSS Modules** for styling

### Backend
- **Node.js** with TypeScript
- **Apollo Server** with Express
- **GraphQL** with subscriptions
- **MongoDB** with Mongoose
- **Node-cron** for job scheduling
- **Unofficial Medium API** via RapidAPI

## 📋 Prerequisites

- Node.js 16+ 
- MongoDB (local or cloud)
- RapidAPI account (optional, for real Medium API access)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd buffertest
```

### 2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

Create a `.env` file in the backend directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/medium-scheduler

# RapidAPI Key (Optional - for real Medium API access)
RAPIDAPI_KEY=your_rapidapi_key_here

# Server Port
PORT=4000
```

### 4. Start the development servers

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend GraphQL: http://localhost:4000/graphql
- WebSocket Subscriptions: ws://localhost:4000/graphql

## 🔧 API Configuration

### Unofficial Medium API

This app uses the [Unofficial Medium API](https://mediumapi.com/) via RapidAPI instead of the deprecated official Medium API.

**To get real API access:**

1. Sign up at [RapidAPI](https://rapidapi.com/)
2. Subscribe to the [Medium API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/medium2)
3. Get your API key from the RapidAPI dashboard
4. Add it to your backend `.env` file as `RAPIDAPI_KEY`

**Current Status:**
- Posts are currently **simulated** for development
- The API integration is ready for real usage once you add your RapidAPI key
- All scheduling and real-time features work with simulated publishing

## 📱 Usage

### Creating Posts

1. **Navigate to Create Post**: Click "Create Post" in the navigation
2. **Choose Mode**: 
   - **Schedule for Later**: Set a future date/time
   - **Publish Now**: Publish immediately
3. **Fill Details**:
   - Title (required)
   - Content in Markdown format (required)
   - Schedule time (if scheduling)
   - RapidAPI key (optional)
4. **Submit**: Click "Schedule Post" or "Publish Now"

### Viewing Posts

- **Real-time Updates**: Post status updates automatically
- **Status Indicators**: 
  - 🟡 Pending: Scheduled but not yet published
  - 🟢 Published: Successfully published to Medium
  - 🔴 Failed: Publishing failed
- **Manual Refresh**: Click "Refresh" to manually update the list

## 🔄 Real-time Features

### GraphQL Subscriptions
- **Post Status Changes**: Live updates when post status changes
- **Publication Events**: Special notifications when posts are published
- **WebSocket Connection**: Automatic reconnection on network issues

### Automatic Updates
- **30-second Polling**: Fallback polling for reliability
- **Cache Updates**: Apollo Client cache stays synchronized
- **Toast Notifications**: Instant feedback for all events

## 🗄️ Database Schema

### ScheduledPost Model
```typescript
interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  scheduledFor: Date;
  publishedAt?: Date;
  status: 'pending' | 'published' | 'failed';
  mediumPostId?: string;
  mediumApiToken: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔌 GraphQL API

### Queries
- `scheduledPosts`: Get all posts
- `scheduledPost(id)`: Get specific post
- `pendingPosts`: Get posts ready for publishing

### Mutations
- `createScheduledPost`: Create new post
- `updateScheduledPost`: Update existing post
- `deleteScheduledPost`: Delete post
- `publishPost`: Manually publish post
- `publishPostNow`: Publish immediately
- `updatePostStatus`: Update post status

### Subscriptions
- `postStatusChanged`: Real-time status updates
- `postPublished`: Publication event notifications

## 🎨 UI Components

### Responsive Design
- **Desktop**: Full-featured layout with grid cards
- **Tablet**: Optimized for medium screens
- **Mobile**: Stacked layout with touch-friendly controls

### Modern Styling
- **CSS Grid**: Flexible post card layouts
- **Hover Effects**: Interactive elements
- **Toast Notifications**: Non-intrusive feedback
- **Loading States**: Clear progress indicators

## 🚀 Deployment

### Backend Deployment
1. Build the TypeScript: `npm run build`
2. Set environment variables
3. Start with: `npm start`

### Frontend Deployment
1. Build for production: `npm run build`
2. Deploy the `dist` folder to your hosting service

## 🔧 Development

### Available Scripts

**Backend:**
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Start production server

**Frontend:**
- `npm run dev`: Start Vite development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

### Storybook
```bash
cd frontend
npm run storybook
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information

---

**Note**: This app currently uses simulated publishing for development. To enable real Medium publishing, you'll need to implement a custom solution or integrate with Medium's official publishing API when available. 