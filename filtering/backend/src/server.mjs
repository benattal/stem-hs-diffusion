import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createApp } from '../../../packages/core/backend/src/app.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const slidesDir = resolve(__dirname, '../../frontend/src/slides');
const app = createApp(slidesDir);

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`Vision Workshop API Server (filtering)`);
  console.log('='.repeat(60));
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  - http://localhost:${PORT}/`);
  console.log(`  - http://localhost:${PORT}/health`);
  console.log('='.repeat(60));
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});

export default server;
