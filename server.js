const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');

const app = express();

// Middleware
app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use(config.API_ENDPOINTS.AUTH, require('./routes/auth'));
app.use(config.API_ENDPOINTS.ROOMS, require('./routes/rooms'));
app.use(config.API_ENDPOINTS.BOOKINGS, require('./routes/bookings'));
app.use(config.API_ENDPOINTS.USERS, require('./routes/users'));

// Health check endpoint
app.get(config.API_ENDPOINTS.HEALTH, (req, res) => {
  res.json({ 
    message: 'Server is running!',
    environment: config.NODE_ENV,
    apiBaseUrl: config.API_BASE_URL
  });
});

app.listen(config.PORT, () => {
  console.log(`Server is running on ${config.API_BASE_URL}`);
  console.log(`Environment: ${config.NODE_ENV}`);
});
