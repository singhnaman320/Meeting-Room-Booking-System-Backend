const mongoose = require('mongoose');
const Room = require('../models/Room');
const User = require('../models/User');
const Booking = require('../models/Booking');
const config = require('../config/config');

const clearAndSeedRooms = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Clearing existing rooms...');
    await Room.deleteMany({});
    
    console.log('Creating rooms with proper location enum values...');
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
    
    // Verify rooms were created
    const roomCount = await Room.countDocuments();
    console.log(`📊 Total rooms in database: ${roomCount}`);
    
    // List all rooms
    const allRooms = await Room.find().select('name location capacity');
    console.log('\n📋 Created rooms:');
    allRooms.forEach(room => {
      console.log(`  - ${room.name} (${room.location}) - Capacity: ${room.capacity}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run if called directly
if (require.main === module) {
  clearAndSeedRooms();
}

module.exports = clearAndSeedRooms;
