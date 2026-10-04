const mongoose = require('mongoose');

const scamPatternSchema = new mongoose.Schema({
    patternText: {
        type: String,
        trim: true
    },
    keywords: [{
        type: String,
        required: true,
        trim: true
    }],
    category: {
        type: String,
        enum: ['kyc', 'electricity', 'parcel', 'lottery', 'loan', 'job', 'impersonation', 'other'],
        required: true
    },
    region: {
        type: String, 
        default: 'national'
    },
    verifiedCount: {
        type: Number,
        default: 0 
    },
    occurrenceCount: {
        type: Number,
        default: 1 // Tracks how many times the AI has caught this exact text
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending' 
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('ScamPattern', scamPatternSchema);