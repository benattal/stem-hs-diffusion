import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pollRouter from './routes/poll.js';
import numericPollRouter from './routes/numericPoll.js';
import slideSyncRouter from './routes/slideSync.js';
import createNotesRouter from './routes/notes.js';
import authRouter, { requirePresenter } from './routes/auth.js';

/**
 * Create an Express app for a presentation backend.
 * @param {string} slidesDir - Absolute path to the frontend/src/slides directory for notes saving
 */
export function createApp(slidesDir) {
  const app = express();

  app.use(helmet());

  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json());

  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });

  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/poll', pollRouter);
  app.use('/api/numeric-poll', numericPollRouter);
  app.use('/api/slide-sync', slideSyncRouter);
  app.use('/api/notes', requirePresenter, createNotesRouter(slidesDir));

  app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'vision-workshop-api' });
  });

  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  });

  return app;
}
