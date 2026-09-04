const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    guardianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reaction: {
        type: String,
        enum: ['safe', 'suspicious', 'scam'], // Mirrors the primary traffic-light system
        required: true
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 200 // Keep it short, no essays needed
    }
}, { timestamps: true });

const verificationRequestSchema = new mongoose.Schema({
    checkId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Check',
        required: true,
        unique: true // One check can only have one active verification request
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    responses: [responseSchema],
    status: {
        type: String,
        enum: ['open', 'resolved'],
        default: 'open'
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);