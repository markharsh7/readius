// server/routes/authRoutes.js
const express = require('express');
const { loginWithGoogle } = require('../controllers/authController');
const router = express.Router();

router.post('/google-login', loginWithGoogle);

module.exports = router;