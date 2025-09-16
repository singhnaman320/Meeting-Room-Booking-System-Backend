const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Room = require('../models/Room');
const config = require('../config/config');

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Room.deleteMany({});

    // Create admin user
    console.log('Creating admin user...');
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      department: 'IT',
      role: 'admin'
    });
    await adminUser.save();

    // Create employee user
    console.log('Creating employee user...');
    const employeeUser = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      department: 'Marketing',
      role: 'employee'
    });
    await employeeUser.save();

    // Create sample rooms
    console.log('Creating sample rooms...');
    const rooms = [
      {
        name: 'Conference Room A',
        capacity: 10,
        location: 'Floor 1, Wing A',
        amenities: ['projector', 'whiteboard', 'wifi', 'air_conditioning'],
        description: 'Large conference room with modern amenities'
      },
      {
        name: 'Meeting Room B',
        capacity: 6,
        location: 'Floor 2, Wing B',
        amenities: ['wifi', 'whiteboard', 'video_conference'],
        description: 'Medium-sized meeting room perfect for team meetings'
      },
      {
        name: 'Board Room',
        capacity: 15,
        location: 'Floor 3, Executive Wing',
        amenities: ['projector', 'video_conference', 'audio_system', 'wifi', 'air_conditioning'],
        description: 'Executive board room for important meetings'
      },
      {
        name: 'Training Room',
        capacity: 20,
        location: 'Floor 1, Training Center',
        amenities: ['projector', 'whiteboard', 'audio_system', 'wifi'],
        description: 'Large training room for workshops and seminars'
      }
    ];

    await Room.insertMany(rooms);

    console.log('Database seeded successfully!');
    console.log('\nTest Accounts Created:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Employee: john@example.com / password123');
    console.log('\nSample rooms created: 4 rooms with various amenities');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
