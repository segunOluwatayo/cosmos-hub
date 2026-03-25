require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const apodRoutes = require('./routes/apod');
const asteroidsRoutes = require('./routes/asteroids');
const marsRoutes = require('./routes/mars');
const epicRoutes = require('./routes/epic');
const aiRoutes   = require('./routes/ai');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  // Will need to add the deployed frontend URL here when deploying
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET'],
    optionsSuccessStatus: 200,
  })
);

// Logging 
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Body Parsing 
app.use(express.json());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again in 15 minutes.' },
});
app.use('/api', apiLimiter);

// Health Check 
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'CosmosHub API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes 
app.use('/api/apod', apodRoutes);
app.use('/api/asteroids', asteroidsRoutes);
app.use('/api/mars', marsRoutes);
app.use('/api/epic', epicRoutes);
app.use('/api/ai',   aiRoutes);

// 404 Handler 
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use(errorHandler);

// Start Server 
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n CosmosHub API running on http://localhost:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV}`);
    console.log(` NASA API Key: ${process.env.NASA_API_KEY === 'DEMO_KEY' ? 'DEMO_KEY (limited)' : 'Custom key'}\n`);
  });
}

module.exports = app;