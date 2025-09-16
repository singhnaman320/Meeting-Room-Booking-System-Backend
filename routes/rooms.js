const express = require('express');
const { body, validationResult } = require('express-validator');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all rooms
router.get('/', auth, async (req, res) => {
  try {
    const { capacity, amenities, location } = req.query;
    let query = { isAvailable: true };

    if (capacity) {
      query.capacity = { $gte: parseInt(capacity) };
    }

    if (amenities) {
      const amenitiesArray = amenities.split(',');
      query.amenities = { $in: amenitiesArray };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const rooms = await Room.find(query).sort({ name: 1 });
    res.json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get room by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check room availability
router.get('/:id/availability', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const roomId = req.params.id;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      room: roomId,
      status: 'active',
      startTime: { $gte: startOfDay },
      endTime: { $lte: endOfDay }
    }).sort({ startTime: 1 });

    res.json({ bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create room (Admin only)
router.post('/', adminAuth, [
  body('name').trim().notEmpty().withMessage('Room name is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  body('location').trim().notEmpty().withMessage('Location is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, capacity, location, amenities, description } = req.body;

    const room = new Room({
      name,
      capacity,
      location,
      amenities: amenities || [],
      description: description || ''
    });

    await room.save();
    res.status(201).json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update room (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, capacity, location, amenities, description, isAvailable } = req.body;

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { name, capacity, location, amenities, description, isAvailable },
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete room (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if room has active bookings
    const activeBookings = await Booking.countDocuments({
      room: req.params.id,
      status: 'active',
      startTime: { $gte: new Date() }
    });

    if (activeBookings > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete room with active bookings' 
      });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
