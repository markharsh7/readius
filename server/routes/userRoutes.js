// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { updateUserPhone } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// This route is protected. User must be logged in.
router.post('/update-phone', protect, updateUserPhone);

module.exports = router;