import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';
import { SchedulerService } from './services/schedulerService';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Create WebSocket server
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

// Create executable schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Set up WebSocket server
useServer({ schema }, wsServer);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Create Apollo Server
const server = new ApolloServer({
  schema,
  context: ({ req }) => {
    return { req };
  },
  plugins: [
    {
      async serverWillStart() {
        console.log('Server starting up!');
      },
    },
  ],
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medium-scheduler')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Start the scheduler service
const scheduler = SchedulerService.getInstance();
scheduler.start();

// Apply middleware
server.start().then(() => {
  server.applyMiddleware({ app, path: '/graphql' });
});

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  console.log(`🔌 Subscriptions ready at ws://localhost:${PORT}${server.graphqlPath}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  const scheduler = SchedulerService.getInstance();
  scheduler.stop();
  await mongoose.connection.close();
  process.exit(0);
}); 