const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all bookings for current user
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await Booking.find(query)
      .populate('room', 'name location capacity')
      .sort({ startTime: 1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookings (Admin view)
router.get('/', auth, async (req, res) => {
  try {
    const { room, status, date } = req.query;
    let query = {};

    if (room) {
      query.room = room;
    }

    if (status) {
      query.status = status;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.startTime = { $gte: startOfDay };
      query.endTime = { $lte: endOfDay };
    }

    const bookings = await Booking.find(query)
      .populate('room', 'name location capacity')
      .populate('user', 'name email department')
      .sort({ startTime: 1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get booking by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('room', 'name location capacity amenities')
      .populate('user', 'name email department');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check for booking conflicts
const checkBookingConflict = async (roomId, startTime, endTime, excludeBookingId = null) => {
  const query = {
    room: roomId,
    status: 'active',
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await Booking.findOne(query);
  return conflictingBooking;
};

// Create booking
router.post('/', auth, [
  body('room').isMongoId().withMessage('Valid room ID is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required'),
  body('attendees').isInt({ min: 1 }).withMessage('Number of attendees must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { room, title, description, startTime, endTime, attendees, isRecurring, recurringPattern } = req.body;

    // Validate room exists and is available
    const roomDoc = await Room.findById(room);
    if (!roomDoc || !roomDoc.isAvailable) {
      return res.status(400).json({ message: 'Room not found or not available' });
    }

    // Check room capacity
    if (attendees > roomDoc.capacity) {
      return res.status(400).json({ 
        message: `Room capacity is ${roomDoc.capacity}, but ${attendees} attendees requested` 
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    // Validate booking times
    if (start >= end) {
      return res.status(400).json({ 
        message: 'End time must be after start time' 
      });
    }

    if (start < now) {
      return res.status(400).json({ 
        message: 'Cannot book meetings in the past' 
      });
    }

    // Check maximum booking duration (24 hours)
    const maxDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (end - start > maxDuration) {
      return res.status(400).json({ 
        message: 'Booking duration cannot exceed 24 hours' 
      });
    }

    // Check for conflicts
    const conflict = await checkBookingConflict(room, start, end);
    if (conflict) {
      return res.status(400).json({ 
        message: 'Room is already booked for this time slot' 
      });
    }

    // Create booking
    const booking = new Booking({
      room,
      user: req.user._id,
      title,
      description: description || '',
      startTime: start,
      endTime: end,
      attendees,
      isRecurring: isRecurring || false,
      recurringPattern: isRecurring ? recurringPattern : undefined
    });

    await booking.save();

    // If recurring, create additional bookings
    if (isRecurring && recurringPattern) {
      await createRecurringBookings(booking, recurringPattern);
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('room', 'name location capacity')
      .populate('user', 'name email');

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to create recurring bookings
const createRecurringBookings = async (parentBooking, pattern) => {
  const { frequency, interval, endDate, daysOfWeek } = pattern;
  const recurringBookings = [];
  
  let currentDate = new Date(parentBooking.startTime);
  const bookingDuration = parentBooking.endTime - parentBooking.startTime;
  const finalEndDate = new Date(endDate);

  while (currentDate <= finalEndDate) {
    // Calculate next occurrence based on frequency
    switch (frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + interval);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + (7 * interval));
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + interval);
        break;
    }

    if (currentDate > finalEndDate) break;

    // For weekly recurring, check if current day is in daysOfWeek
    if (frequency === 'weekly' && daysOfWeek && daysOfWeek.length > 0) {
      if (!daysOfWeek.includes(currentDate.getDay())) {
        continue;
      }
    }

    const newStartTime = new Date(currentDate);
    const newEndTime = new Date(currentDate.getTime() + bookingDuration);

    // Check for conflicts before creating
    const conflict = await checkBookingConflict(parentBooking.room, newStartTime, newEndTime);
    if (!conflict) {
      const recurringBooking = new Booking({
        room: parentBooking.room,
        user: parentBooking.user,
        title: parentBooking.title,
        description: parentBooking.description,
        startTime: newStartTime,
        endTime: newEndTime,
        attendees: parentBooking.attendees,
        isRecurring: true,
        parentBooking: parentBooking._id
      });

      recurringBookings.push(recurringBooking);
    }
  }

  if (recurringBookings.length > 0) {
    await Booking.insertMany(recurringBookings);
  }
};

// Update booking
router.put('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, startTime, endTime, attendees } = req.body;

    // If time is being changed, check for conflicts
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const now = new Date();
      
      // Validate booking times
      if (start >= end) {
        return res.status(400).json({ 
          message: 'End time must be after start time' 
        });
      }

      if (start < now) {
        return res.status(400).json({ 
          message: 'Cannot book meetings in the past' 
        });
      }

      // Check maximum booking duration (24 hours)
      const maxDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      if (end - start > maxDuration) {
        return res.status(400).json({ 
          message: 'Booking duration cannot exceed 24 hours' 
        });
      }
      
      const conflict = await checkBookingConflict(booking.room, start, end, booking._id);
      if (conflict) {
        return res.status(400).json({ 
          message: 'Room is already booked for this time slot' 
        });
      }

      booking.startTime = start;
      booking.endTime = end;
    }

    if (title) booking.title = title;
    if (description !== undefined) booking.description = description;
    if (attendees) booking.attendees = attendees;

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('room', 'name location capacity')
      .populate('user', 'name email');

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // If this is a recurring booking, optionally cancel all future instances
    const { cancelAll } = req.body;
    if (cancelAll && booking.isRecurring) {
      await Booking.updateMany(
        {
          $or: [
            { parentBooking: booking._id },
            { parentBooking: booking.parentBooking }
          ],
          startTime: { $gte: new Date() },
          status: 'active'
        },
        { status: 'cancelled' }
      );
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
