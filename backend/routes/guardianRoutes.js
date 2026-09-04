const express = require('express');
const router = express.Router();
const { 
    inviteGuardian, 
    acceptInvite, 
    requestVerification, 
    submitResponse,
    getMyGuardians,
    getMyInvitations,
    removeLink,
    getPendingRequests 
} = require('../controllers/guardianController');
const { protect } = require('../middleware/authMiddleware');

// ALL guardian routes require the user to be logged in via JWT
router.use(protect);

router.get('/my-guardians', getMyGuardians);
router.get('/my-invitations', getMyInvitations);
router.get('/pending-requests', getPendingRequests);


router.post('/invite', inviteGuardian);
router.post('/accept', acceptInvite);
router.post('/request-verification', requestVerification);
router.post('/submit-response', submitResponse);

router.delete('/remove-link/:linkId', removeLink);

module.exports = router;