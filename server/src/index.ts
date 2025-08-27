import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import tasksRouter from './routes/tasks.js';
import notesRouter from './routes/notes.js';
import aiGuideRouter from './routes/aiGuide.js';
import dashboardRouter from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/tasks', tasksRouter);
app.use('/api/notes', notesRouter);
app.use('/api/ai-guide', aiGuideRouter);
app.use('/api/dashboard', dashboardRouter);

// Welcome endpoint
app.get('/api/welcome', (_, res) => {
  res.json({
    message: 'Welcome to Project Athena - Personal Productivity & Knowledge Management',
    version: '1.0.0',
    features: ['Task Management', 'Knowledge Base', 'AI Socratic Guide']
  });
});

// Error handling
app.use((err: Error, _: express.Request, res: express.Response, __: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🧠 Athena Server running on port ${PORT}`);
  console.log(`📋 Tasks API: http://localhost:${PORT}/api/tasks`);
  console.log(`📝 Notes API: http://localhost:${PORT}/api/notes`);
  console.log(`🤖 AI Guide API: http://localhost:${PORT}/api/ai-guide`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});