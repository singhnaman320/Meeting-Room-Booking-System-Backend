// Import required dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');

// Create Express application instance
const app = express();

// Configure CORS (Cross-Origin Resource Sharing) middleware
// This controls which domains can access our API from web browsers
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl requests)
    if (!origin) return callback(null, true);
    
    // Define list of allowed origins (frontend URLs that can access this API)
    const allowedOrigins = [
      config.CLIENT_URL,                                              // Local development frontend (http://localhost:3000)
      ...config.PRODUCTION_CLIENT_URLS,                              // Production URLs from config file
      'https://meeting-room-booking-system-fronten.vercel.app'       // Deployed Vercel frontend URL
    ];
    
    // Check if the request origin is in our allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);  // Allow the request
    } else {
      console.log('CORS blocked origin:', origin);  // Log blocked attempts for security monitoring
      callback(new Error('Not allowed by CORS'));   // Reject the request
    }
  },
  credentials: true  // Allow cookies and authentication headers to be sent with requests
}));

// Parse incoming JSON requests and make the data available in req.body
app.use(express.json());

// Connect to MongoDB database
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,    // Use new URL parser to avoid deprecation warnings
  useUnifiedTopology: true, // Use new Server Discover and Monitoring engine
})
.then(() => console.log('MongoDB connected successfully'))  // Log successful connection
.catch(err => console.log('MongoDB connection error:', err)); // Log connection errors

// Mount API route modules at their respective endpoints
// Each route module handles a specific domain of the application
app.use(config.API_ENDPOINTS.AUTH, require('./routes/auth'));           // Authentication routes: /api/auth (login, register, profile)
app.use(config.API_ENDPOINTS.ROOMS, require('./routes/rooms'));         // Room management routes: /api/rooms (CRUD operations)
app.use(config.API_ENDPOINTS.BOOKINGS, require('./routes/bookings'));   // Booking management routes: /api/bookings (create, view, edit, cancel)
app.use(config.API_ENDPOINTS.USERS, require('./routes/users'));         // User management routes: /api/users (profile updates)

// Health check endpoint - used to verify server status
// Accessible at /api/health - useful for monitoring and deployment health checks
app.get(config.API_ENDPOINTS.HEALTH, (req, res) => {
  res.json({ 
    message: 'Server is running!',        // Confirmation message
    environment: config.NODE_ENV,         // Current environment (development/production)
    apiBaseUrl: config.API_BASE_URL       // Server's base URL
  });
});

// Start the server and listen for incoming requests
app.listen(config.PORT, () => {
  console.log(`Server is running on ${config.API_BASE_URL}`);  // Log server URL
  console.log(`Environment: ${config.NODE_ENV}`);              // Log current environment
});
