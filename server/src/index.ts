import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { createServer } from 'node:http';
import mongoose from 'mongoose';
import { Server as SocketServer } from 'socket.io';
import * as swaggerUi from 'swagger-ui-express';

import { env, swaggerSpec } from './config';
import { rootController } from './controllers';
import { errorMiddleware } from './middlewares';
import { conversationRoutes, messageRoutes, routes, usersRoutes } from './routes';
import { registerSocketHandlers } from './sockets';

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.get('/', rootController);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (request, response) => {
  void request;
  response.json(swaggerSpec);
});
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', usersRoutes);
app.use('/api', routes);
app.use(errorMiddleware);

const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: { origin: env.clientUrl, credentials: true },
});

registerSocketHandlers(io);

async function startServer(): Promise<void> {
  await mongoose.connect(env.mongoUri);

  httpServer.listen(env.port, () => {
    console.log(`Server is running on http://localhost:${env.port}`);
  });
}

startServer().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Failed to start server:', message);
  process.exit(1);
});
