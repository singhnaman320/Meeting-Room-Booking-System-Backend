# Meeting Room Booking System - Backend

A modern, employee-focused meeting room booking system backend built with Node.js, Express, and MongoDB.

## 🚀 Features

### Core Functionality
- **Employee Authentication** - JWT-based secure login/registration with redirect to login after signup
- **Room Management** - Create, read, update, delete meeting rooms with filtering
- **Booking System** - Complete booking lifecycle with validation and conflict prevention
- **Profile Management** - User profile updates (name, email, department)
- **Booking Validation** - Prevents past bookings and enforces 24-hour maximum duration

### Key Characteristics
- **Employee-Only Access** - Simplified permission system (no admin roles)
- **Collaborative Room Management** - All employees can manage room inventory
- **Owner-Based Booking Control** - Users can only modify their own bookings
- **RESTful API Design** - Clean, consistent API endpoints
- **Comprehensive Validation** - Input validation and error handling

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: bcryptjs for password hashing
- **Environment**: dotenv for configuration

## 📁 Project Structure

```
server/
├── models/           # MongoDB schemas
│   ├── User.js      # User model (employee-only)
│   ├── Room.js      # Meeting room model
│   └── Booking.js   # Booking model
├── routes/          # API endpoints
│   ├── auth.js      # Authentication routes
│   ├── users.js     # User profile management
│   ├── rooms.js     # Room CRUD operations
│   └── bookings.js  # Booking management
├── middleware/      # Custom middleware
│   └── auth.js      # JWT authentication
├── seeders/         # Database seeding
│   └── seedDatabase.js
├── scripts/         # Utility scripts
│   └── clearAndSeed.js
└── server.js        # Application entry point
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Environment Variables
Create a `.env` file in the server root:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/meeting-room-booking
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

3. **Seed Database (Optional)**
   ```bash
   npm run seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new employee
- `POST /api/auth/login` - Employee login
- `GET /api/auth/me` - Get current user info

### Users
- `PUT /api/users/profile` - Update user profile

### Rooms
- `GET /api/rooms` - Get all available rooms
- `GET /api/rooms/:id` - Get room by ID
- `GET /api/rooms/:id/availability` - Check room availability
- `POST /api/rooms` - Create new room
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/my` - Get user's bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking (owner only)
- `PATCH /api/bookings/:id/cancel` - Cancel booking (owner only)
- `DELETE /api/bookings/:id` - Delete booking (owner only)

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  department: String,
  role: String (always 'employee'),
  createdAt: Date,
  updatedAt: Date
}
```

### Room Model
```javascript
{
  name: String (required),
  capacity: Number (required),
  location: String (required),
  amenities: [String],
  description: String,
  isAvailable: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Model
```javascript
{
  title: String (required),
  description: String,
  room: ObjectId (ref: Room),
  user: ObjectId (ref: User),
  startTime: Date (required),
  endTime: Date (required),
  attendees: Number,
  status: String (enum: ['active', 'cancelled']),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **Input Validation** - express-validator for request validation
- **CORS Protection** - Cross-origin request handling
- **Error Handling** - Comprehensive error responses

## 🚀 Deployment

### Live Deployment
- **Platform**: Render
- **URL**: [Backend API on Render](https://meeting-room-booking-system-backend.onrender.com)
- **Database**: MongoDB Atlas (Cloud)
- **Environment**: Production

### Environment Setup
- Set `NODE_ENV=production`
- Configure production MongoDB URI (MongoDB Atlas)
- Set secure JWT secret
- Configure CORS for production domain (Vercel frontend)

### Deployment Platforms
- **Render** ✅ - Currently deployed (recommended for Node.js)
- **Heroku** - Traditional PaaS option
- **Railway** - Modern deployment platform
- **DigitalOcean App Platform** - Scalable hosting

## 📝 Recent Changes

### Major Modifications
- ✅ **Authentication Flow** - Registration now redirects to login (no auto-login)
- ✅ **Booking Validation** - Added past date prevention and 24-hour duration limit
- ✅ **Time Handling** - Proper datetime validation and conflict detection
- ✅ **Error Handling** - User-friendly error messages for all validation failures
- ✅ **Security Enhancements** - Comprehensive input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
