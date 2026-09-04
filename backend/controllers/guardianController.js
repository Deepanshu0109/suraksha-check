const User = require('../models/User');
const GuardianLink = require('../models/GuardianLink');
const VerificationRequest = require('../models/VerificationRequest');
const Check = require('../models/Check');

// Helper function to match WhatsApp's phone format
const normalizePhone = (phone) => {
    let cleaned = phone.toString().replace(/\D/g, '');
    if (cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }
    return cleaned;
};

// Primary user invites a guardian
exports.inviteGuardian = async (req, res) => {
    const primaryId = req.user.id; 
    const { guardianPhone } = req.body;

    if (!guardianPhone) {
        return res.status(400).json({ error: 'Guardian phone number is required' });
    }

    const normalizedPhone = normalizePhone(guardianPhone);

    try {
        // 1. STRICT CHECK: Does the guardian exist and do they have a name?
        const guardian = await User.findOne({ phone: normalizedPhone });
        
        if (!guardian || !guardian.name) {
            return res.status(404).json({ error: 'This number is not registered. Please ask them to create a Guardian account first.' });
        }

        // Make sure they actually registered as a Guardian
        if (guardian.role !== 'guardian') {
            return res.status(400).json({ error: 'This user is registered as a Main User, not a Guardian.' });
        }

        // 2. Prevent linking to oneself
        if (guardian._id.toString() === primaryId) {
            return res.status(400).json({ error: 'You cannot link to yourself' });
        }

        // 3. Create the pending link
        const existingLink = await GuardianLink.findOne({ primaryUser: primaryId, guardianUser: guardian._id });
        if (existingLink) {
            return res.status(400).json({ error: 'Link already exists or is pending' });
        }

        const newLink = await GuardianLink.create({
            primaryUser: primaryId,
            guardianUser: guardian._id,
            status: 'pending',
            shareFullContent: false
        });

        res.status(201).json({ message: 'Invitation sent to guardian', link: newLink });
    } catch (error) {
        console.error('Error inviting guardian:', error);
        res.status(500).json({ error: 'Server error during invitation' });
    }
};

// Guardian accepts the invitation
exports.acceptInvite = async (req, res) => {
    const guardianId = req.user.id;
    const { linkId } = req.body;

    try {
        const link = await GuardianLink.findOne({ _id: linkId, guardianUser: guardianId });
        
        if (!link) {
            return res.status(404).json({ error: 'Invitation not found' });
        }

        if (link.status === 'active') {
            return res.status(400).json({ error: 'Link is already active' });
        }

        link.status = 'active';
        await link.save();

        // Update the arrays on both User models for faster querying later
        await User.findByIdAndUpdate(link.primaryUser, { $addToSet: { guardians: guardianId } });
        await User.findByIdAndUpdate(guardianId, { $addToSet: { linkedPrimaries: link.primaryUser } });

        res.status(200).json({ message: 'Invitation accepted successfully', link });
    } catch (error) {
        console.error('Error accepting invitation:', error);
        res.status(500).json({ error: 'Server error during acceptance' });
    }
};

exports.requestVerification = async (req, res) => {
    const primaryId = req.user.id;
    const { checkId } = req.body;

    if (!checkId) {
        return res.status(400).json({ error: 'Check ID is required' });
    }

    try {
        // 1. Verify the message actually belongs to the user asking
        const check = await Check.findOne({ _id: checkId, userId: primaryId });
        if (!check) {
            return res.status(404).json({ error: 'Message not found or unauthorized' });
        }

        // 2. Check if they actually have any active guardians
        const user = await User.findById(primaryId);
        if (!user.guardians || user.guardians.length === 0) {
            return res.status(400).json({ error: 'You have no active guardians linked to your account' });
        }

        // 3. Prevent duplicate requests for the same message
        const existingReq = await VerificationRequest.findOne({ checkId });
        if (existingReq) {
            return res.status(400).json({ error: 'Verification already requested for this message' });
        }

        // 4. Create the request
        const newRequest = await VerificationRequest.create({
            checkId: checkId,
            requestedBy: primaryId,
            responses: [], // Starts empty, waiting for guardian votes
            status: 'open'
        });

        // (Later in Week 7: We will trigger a Push Notification to the guardians here)

        res.status(201).json({ 
            message: 'Verification request sent to your guardians', 
            request: newRequest 
        });

    } catch (error) {
        console.error('Error requesting verification:', error);
        res.status(500).json({ error: 'Server error during verification request' });
    }
};

// Guardian submits a vote on a pending request
exports.submitResponse = async (req, res) => {
    const guardianId = req.user.id;
    const { requestId, reaction, comment } = req.body;

    if (!requestId || !reaction) {
        return res.status(400).json({ error: 'Request ID and reaction are required' });
    }

    try {
        // 1. Find the request and populate the primary user's details
        const request = await VerificationRequest.findById(requestId).populate('requestedBy');
        
        if (!request) {
            return res.status(404).json({ error: 'Verification request not found' });
        }

        if (request.status === 'resolved') {
            return res.status(400).json({ error: 'This request has already been resolved' });
        }

        // 2. Security Check: Is this person actually an active guardian for this specific user?
        const primaryUser = request.requestedBy;
        if (!primaryUser.guardians.includes(guardianId)) {
            return res.status(403).json({ error: 'You are not authorized to review this request' });
        }

        // 3. Prevent duplicate votes
        const hasVoted = request.responses.some(r => r.guardianId.toString() === guardianId);
        if (hasVoted) {
            return res.status(400).json({ error: 'You have already submitted a response for this request' });
        }

        // 4. Record the vote
        request.responses.push({
            guardianId,
            reaction,
            comment
        });

        await request.save();

        res.status(200).json({ message: 'Response recorded successfully', request });

    } catch (error) {
        console.error('Error submitting response:', error);
        res.status(500).json({ error: 'Server error during submission' });
    }
};

// Fetch guardians linked to the primary user (Active and Pending)
exports.getMyGuardians = async (req, res) => {
    try {
        const links = await GuardianLink.find({ primaryUser: req.user.id })
            .populate('guardianUser', 'name phone role')
            .sort({ createdAt: -1 });
            
        res.status(200).json({ links });
    } catch (error) {
        console.error('Error fetching guardians:', error);
        res.status(500).json({ error: 'Server error fetching guardians' });
    }
};

// Fetch pending invitations for a guardian
exports.getMyInvitations = async (req, res) => {
    try {
        const invitations = await GuardianLink.find({ 
            guardianUser: req.user.id, 
            status: 'pending' 
        })
        .populate('primaryUser', 'name phone')
        .sort({ createdAt: -1 });

        res.status(200).json({ invitations });
    } catch (error) {
        console.error('Error fetching invitations:', error);
        res.status(500).json({ error: 'Server error fetching invitations' });
    }
};

// Remove a guardian link (either by primary user or guardian)
exports.removeLink = async (req, res) => {
    const primaryId = req.user.id;
    const { linkId } = req.params;

    try {
        const link = await GuardianLink.findOne({ _id: linkId, primaryUser: primaryId });
        if (!link) {
            return res.status(404).json({ error: 'Link not found' });
        }

        // If it was already active, we must remove the IDs from the users' arrays
        if (link.status === 'active') {
            await User.findByIdAndUpdate(primaryId, { $pull: { guardians: link.guardianUser } });
            await User.findByIdAndUpdate(link.guardianUser, { $pull: { linkedPrimaries: primaryId } });
        }

        // Delete the link document
        await GuardianLink.findByIdAndDelete(linkId);

        res.status(200).json({ message: 'Link removed successfully' });
    } catch (error) {
        console.error('Error removing link:', error);
        res.status(500).json({ error: 'Server error removing link' });
    }
};

// Fetch pending verification requests for a guardian
exports.getPendingRequests = async (req, res) => {
    try {
        const guardianId = req.user.id;
        
        // 1. Find all Main Users linked to this guardian
        const guardian = await User.findById(guardianId).populate('linkedPrimaries');
        if (!guardian || !guardian.linkedPrimaries) {
            return res.status(200).json({ requests: [] });
        }
        
        const primaryIds = guardian.linkedPrimaries.map(p => p._id);

        // 2. Fetch requests from those users that are open AND where this guardian hasn't voted yet
        const requests = await VerificationRequest.find({
            requestedBy: { $in: primaryIds },
            status: 'open',
            'responses.guardianId': { $ne: guardianId } 
        })
        .populate('requestedBy', 'name phone')
        .populate('checkId', 'rawText verdict createdAt')
        .sort({ createdAt: -1 });

        res.status(200).json({ requests });
    } catch (error) {
        console.error('Error fetching verification requests:', error);
        res.status(500).json({ error: 'Server error fetching requests' });
    }
};