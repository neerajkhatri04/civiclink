const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/reports', require('./routes/reports'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/states-zones', require('./routes/statesZones'));
app.use('/api/ai-test', require('./routes/ai-test'));
app.use('/api/email-test', require('./routes/email-test'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'CivicLink Backend'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File size too large. Maximum size is 5MB.'
    });
  }

  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      error: 'Only image files (jpg, png) are allowed.'
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`CivicLink Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
