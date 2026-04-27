require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const { generalLimiter } = require('./middlewares/rateLimiter.middleware');
const { sendError } = require('./utils/response');

// Route imports
const authRoutes = require('./routes/auth.routes');
const contentRoutes = require('./routes/content.routes');
const approvalRoutes = require('./routes/approval.routes');
const broadcastRoutes = require('./routes/broadcast.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security Middleware ────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parsers ───────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Static File Serving (uploaded images) ─────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Global Rate Limiter ────────────────────────────────────────────────
app.use(generalLimiter);

// ── Health Check ───────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Content Broadcasting System is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ── API Routes ─────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/content', contentRoutes);
app.use('/approval', approvalRoutes);
app.use('/content/live', broadcastRoutes);  // Public broadcast API

// ── 404 Handler ────────────────────────────────────────────────────────
app.use((req, res) => {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

// ── Global Error Handler ───────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  return sendError(res, 'Internal server error', 500);
});

// ── Start Server ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Content Broadcasting System');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('📌 API Endpoints:');
  console.log(`  POST   /auth/login`);
  console.log(`  GET    /auth/me`);
  console.log(`  POST   /content/upload      [Teacher]`);
  console.log(`  GET    /content/my          [Teacher]`);
  console.log(`  GET    /content             [Principal]`);
  console.log(`  GET    /content/:id`);
  console.log(`  GET    /approval/pending    [Principal]`);
  console.log(`  PATCH  /approval/:id        [Principal]`);
  console.log(`  GET    /content/live/:teacher_id  [PUBLIC]`);
  console.log('');
});

module.exports = app;
