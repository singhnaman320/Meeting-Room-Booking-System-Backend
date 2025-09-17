const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  location: {
    type: String,
    required: true,
    enum: ['Floor 1 - Wing A', 'Floor 1 - Wing B', 'Floor 1 - Training Center', 'Floor 2 - Wing A', 'Floor 2 - Wing B', 'Floor 3 - Executive Wing', 'Floor 3 - Conference Center', 'Ground Floor - Reception']
  },
  amenities: [{
    type: String,
    enum: ['projector', 'whiteboard', 'video_conference', 'audio_system', 'wifi']
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
