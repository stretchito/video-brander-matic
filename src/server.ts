import express from 'express';
import { corsMiddleware, jsonMiddleware } from './middleware/cors';
import { healthCheck } from './routes/health';
import { processVideoHandler } from './routes/processVideo';
import { getJobStatus } from './routes/jobStatus';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(corsMiddleware);
app.use(jsonMiddleware);

// Routes
app.get('/health', healthCheck);
app.post('/process-video', processVideoHandler);
app.get('/job-status/:jobId', getJobStatus);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});