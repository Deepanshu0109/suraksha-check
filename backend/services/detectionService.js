const ScamPattern = require('../models/ScamPattern');

exports.runRuleBasedCheck = async (messageText) => {
    try {
        // Sanitize text: lowercase and remove most punctuation, but keep Hindi/regional unicode intact
        const normalizedText = messageText.toLowerCase().replace(/[^\w\s\u0900-\u097F]/gi, ''); 

        // Fetch only patterns that the Admin has reviewed and approved
        const patterns = await ScamPattern.find({ status: 'approved' });

        for (const pattern of patterns) {
            // Ensure EVERY keyword in the pattern array exists in the text
            const isMatch = pattern.keywords.every(keyword => 
                normalizedText.includes(keyword.toLowerCase())
            );

            if (isMatch) {
                return {
                    isMatch: true,
                    verdict: 'scam',
                    confidence: 100, // Rule matches are definitive
                    detectionStage: 'rule',
                    explanation: `This matches a known ${pattern.category} scam format circulating currently.`
                };
            }
        }

        // No rules matched. Proceed to AI stage.
        return { isMatch: false, verdict: 'pending' };

    } catch (error) {
        console.error('Error in rule-based check:', error);
        // Fail open: if the database query fails, don't crash, just pass it to the AI
        return { isMatch: false, verdict: 'pending' }; 
    }
};