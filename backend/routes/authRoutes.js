const express = require('express');
const router = express.Router();
const { requestOtp, verifyOtp, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);


router.get('/me', protect, getProfile);

module.exports = router;