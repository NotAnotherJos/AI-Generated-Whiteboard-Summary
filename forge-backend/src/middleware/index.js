const cors = require('cors');
const express = require('express');

// CORS config – allow all origins
const corsOptions = {
  origin: true,  
  credentials: true,  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  optionsSuccessStatus: 200,
  maxAge: 86400  // cache preflight for 1 day
};

// Log each request with duration
const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  next();
};

// Error handler
const errorHandler = (err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred.'
  });
};

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Not Found' });
};

// Apply all middleware
const applyMiddleware = (app) => {
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(requestLogger);
};

module.exports = {
  applyMiddleware,
  errorHandler,
  notFoundHandler
}; 
