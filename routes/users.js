const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();


// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, department } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, department },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
