const ScamPattern = require('../models/ScamPattern');

// Fetch all pending patterns, sorted by highest occurrence first
exports.getPendingPatterns = async (req, res) => {
    try {
        const patterns = await ScamPattern.find({ status: 'pending' })
            .sort({ occurrenceCount: -1 }); // -1 means descending (highest first)
        
        res.status(200).json(patterns);
    } catch (error) {
        console.error('Error fetching pending patterns:', error);
        res.status(500).json({ error: 'Server error fetching patterns' });
    }
};

// Approve a pattern
exports.approvePattern = async (req, res) => {
    try {
        const pattern = await ScamPattern.findByIdAndUpdate(
            req.params.id, 
            { status: 'approved' }, 
            { new: true } // Returns the updated document
        );

        if (!pattern) return res.status(404).json({ error: 'Pattern not found' });
        
        res.status(200).json({ message: 'Pattern approved', pattern });
    } catch (error) {
        console.error('Error approving pattern:', error);
        res.status(500).json({ error: 'Server error approving pattern' });
    }
};

// Reject a pattern
exports.rejectPattern = async (req, res) => {
    try {
        const pattern = await ScamPattern.findByIdAndUpdate(
            req.params.id, 
            { status: 'rejected' }, 
            { new: true }
        );

        if (!pattern) return res.status(404).json({ error: 'Pattern not found' });
        
        res.status(200).json({ message: 'Pattern rejected', pattern });
    } catch (error) {
        console.error('Error rejecting pattern:', error);
        res.status(500).json({ error: 'Server error rejecting pattern' });
    }
};