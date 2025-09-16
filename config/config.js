require('dotenv').config();

const config = {
  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/meeting-room-booking',
  
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // API Configuration
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5000',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  
  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_jwt_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // API Endpoints
  API_ENDPOINTS: {
    AUTH: '/api/auth',
    ROOMS: '/api/rooms',
    BOOKINGS: '/api/bookings',
    USERS: '/api/users',
    HEALTH: '/api/health'
  }
};

module.exports = config;
