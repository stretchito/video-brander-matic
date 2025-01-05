import express from 'express';
import { corsMiddleware, jsonMiddleware } from './middleware/cors';
import { healthCheck } from './routes/health';
import { processVideoHandler } from './routes/processVideo';
import { getJobStatus } from './routes/jobStatus';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure ffmpeg path for production
if (process.env.FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(corsMiddleware);
app.use(jsonMiddleware);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.get('/health', healthCheck);
app.post('/process-video', processVideoHandler);
app.get('/job-status/:jobId', getJobStatus);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('FFmpeg path:', ffmpeg.path);
});

export default app;