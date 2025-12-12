import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import next from 'next';
import { startHourlyJobs } from './cron/hourly/job.js';
import { startDailyJobs } from './cron/daily/job.js';
import agentsRouter from './interface/server/routes/agents.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
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
