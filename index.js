import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import next from 'next';
import createEnv from 'env';
import { startHourlyJobs } from './interface/server/cron/hourly/job.js';
import { startDailyJobs } from './interface/server/cron/daily/job.js';
import agentsRouter from './interface/server/routes/agents.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = createEnv();

const port = Number.parseInt(env('PORT', '3000'), 10);
const dev = env('NODE_ENV', 'development') !== 'production';
const nextApp = next({ dev, dir: path.join(__dirname, 'interface/server/ui') });
const handle = nextApp.getRequestHandler();

/**
 * Prepares Next.js and Express, then starts the HTTP server.
 * @returns {Promise<void>} A promise that resolves when the server is listening.
 */
async function startServer() {
  await nextApp.prepare();
  const server = express();

  server.use(express.json());
  server.use('/api', agentsRouter);

  server.all('*', (req, res) => {
    handle(req, res);
  });

  server.listen(port, () => {
    startHourlyJobs();
    startDailyJobs();
  });
}

startServer();
