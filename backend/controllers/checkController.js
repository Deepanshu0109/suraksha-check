const Check = require('../models/Check');
const VerificationRequest = require('../models/VerificationRequest'); // <-- Added this

exports.getMyChecks = async (req, res) => {
    try {
        // Fetch checks and use .lean() so we can inject extra data into the objects
        const checks = await Check.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .lean(); 
            
        const checkIds = checks.map(c => c._id);

        // Fetch all family verification requests linked to these checks
        const requests = await VerificationRequest.find({ checkId: { $in: checkIds } })
            .populate('responses.guardianId', 'name') // Get the guardian's name
            .lean();

        // Combine the AI check with the family's votes
        const enrichedChecks = checks.map(check => {
            const familyReq = requests.find(r => r.checkId.toString() === check._id.toString());
            return {
                ...check,
                familyRequest: familyReq || null
            };
        });
            
        res.status(200).json({ checks: enrichedChecks });
    } catch (error) {
        console.error('Error fetching checks:', error);
        res.status(500).json({ error: 'Server error fetching checks' });
    }
};