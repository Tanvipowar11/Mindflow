import mongoose from 'mongoose';

import express from 'express';

import { ApolloServer } from 'apollo-server-express';

import { makeExecutableSchema }
from '@graphql-tools/schema';

import { WebSocketServer } from 'ws';

import { useServer } from 'graphql-ws/lib/use/ws';

import { PubSub }
from 'graphql-subscriptions';

import cors from 'cors';

import dotenv from 'dotenv';

import { typeDefs }
from './graphql/typeDefs';

import { resolvers }
from './graphql/resolvers';

import { authMiddleware }
from './middleware/auth';

dotenv.config();

// FIXED HERE
const app: express.Application = express();

const PORT =
  process.env.PORT || 4000;

// Middleware
app.use(cors());

app.use(express.json());

app.use(authMiddleware);

// GraphQL schema
const schema =
  makeExecutableSchema({
    typeDefs,
    resolvers,
  });

// PubSub instance
const pubsub = new PubSub();

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });

// Start server
async function startServer() {

  const server =
    new ApolloServer({

      schema,

      context: ({ req }: any) => ({
        userId: req.userId,

        pubsub,
      }),
    });

  await server.start();

  server.applyMiddleware({
    app: app as any,
  });

  // HTTP server
  const httpServer =
    app.listen(PORT, () => {

      console.log(
        `🚀 Server running at http://localhost:${PORT}/graphql`
      );
    });

  // WebSocket server
  const wsServer =
    new WebSocketServer({

      server: httpServer,

      path: '/graphql',
    });

  useServer(
    {
      schema,
      context: () => ({ pubsub }),
    },

    wsServer
  );
}

startServer().catch(console.error);