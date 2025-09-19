const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const config = require('../config/config');

const seedDatabase = async () => {
  try {
    console.log('Seeding database...');

    // Clear existing data
    await User.deleteMany({});
    await Room.deleteMany({});
    await Booking.deleteMany({}); // Added Booking deleteMany
    
    console.log('Cleared existing data...');

    // Create sample employees
    console.log('Creating sample employees...');
    const users = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        department: 'Marketing'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        department: 'IT'
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: 'password123',
        department: 'Sales'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Successfully created ${createdUsers.length} employees`);

    // Create sample rooms
    console.log('Creating sample rooms...');
    const rooms = [
      {
        name: 'Conference Room A',
        capacity: 10,
        location: 'Floor 1 - Wing A',
        amenities: ['projector', 'whiteboard', 'wifi'],
        description: 'Large conference room with modern amenities'
      },
      {
        name: 'Meeting Room B',
        capacity: 6,
        location: 'Floor 2 - Wing B',
        amenities: ['wifi', 'whiteboard', 'video_conference'],
        description: 'Medium-sized meeting room perfect for team meetings'
      },
      {
        name: 'Board Room',
        capacity: 15,
        location: 'Floor 3 - Executive Wing',
        amenities: ['projector', 'video_conference', 'audio_system', 'wifi'],
        description: 'Executive board room for important meetings'
      },
      {
        name: 'Training Room',
        capacity: 20,
        location: 'Floor 1 - Training Center',
        amenities: ['projector', 'whiteboard', 'audio_system', 'wifi'],
        description: 'Large training room for workshops and seminars'
      },
      {
        name: 'Small Meeting Room 1',
        capacity: 4,
        location: 'Floor 1 - Wing B',
        amenities: ['wifi', 'whiteboard'],
        description: 'Cozy room for small team discussions'
      },
      {
        name: 'Conference Room B',
        capacity: 12,
        location: 'Floor 2 - Wing A',
        amenities: ['projector', 'video_conference', 'wifi'],
        description: 'Modern conference room with video capabilities'
      },
      {
        name: 'Executive Meeting Room',
        capacity: 8,
        location: 'Floor 3 - Conference Center',
        amenities: ['projector', 'audio_system', 'wifi'],
        description: 'Premium meeting space for executive discussions'
      },
      {
        name: 'Reception Meeting Room',
        capacity: 6,
        location: 'Ground Floor - Reception',
        amenities: ['wifi', 'whiteboard'],
        description: 'Convenient ground floor meeting space'
      }
    ];

    const createdRooms = await Room.insertMany(rooms);
    console.log(`✅ Successfully created ${createdRooms.length} rooms`);

    // Verify data was created
    const userCount = await User.countDocuments();
    const roomCount = await Room.countDocuments();
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n👥 Test Employee Accounts Created:');
    console.log('John Doe: john@example.com / password123');
    console.log('Jane Smith: jane@example.com / password123');
    console.log('Mike Johnson: mike@example.com / password123');
    console.log(`\n🏢 Sample rooms created: ${rooms.length} rooms with various amenities and floor locations`);
    console.log(`\n📊 Database Summary:`);
    console.log(`  - Users: ${userCount}`);
    console.log(`  - Rooms: ${roomCount}`);
    
    // List all rooms
    const allRooms = await Room.find().select('name location capacity');
    console.log('\n📋 Created rooms:');
    allRooms.forEach(room => {
      console.log(`  - ${room.name} (${room.location}) - Capacity: ${room.capacity}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
