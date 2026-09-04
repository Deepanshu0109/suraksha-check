const express = require('express');
const router = express.Router();
const { getMyChecks } = require('../controllers/checkController');
const { protect } = require('../middleware/authMiddleware');

// All check routes require authentication
router.use(protect);

router.get('/', getMyChecks);

module.exports = router;