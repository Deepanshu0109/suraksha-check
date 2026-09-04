const express = require('express');
const router = express.Router();
const { verifyWebhook, receiveMessage } = require('../controllers/whatsappController');

// Meta uses a GET request for the initial verification
router.get('/webhook', verifyWebhook);

// Meta uses a POST request to send actual messages and status updates
router.post('/webhook', receiveMessage);

module.exports = router;