const express = require('express');
const router = express.Router();
const { getPendingPatterns, approvePattern, rejectPattern } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ALL routes in this file require both a valid JWT AND the 'admin' role
router.use(protect, adminOnly);

router.get('/pending-patterns', getPendingPatterns);
router.post('/patterns/:id/approve', approvePattern);
router.post('/patterns/:id/reject', rejectPattern);

module.exports = router;