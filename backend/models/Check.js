const mongoose = require('mongoose');

const checkSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    source: {
        type: String,
        enum: ['whatsapp', 'pwa'],
        required: true
    },
    rawText: {
        type: String,
        required: true
    },
    ocrUsed: {
        type: Boolean,
        default: false
    },
    verdict: {
        type: String,
        enum: ['pending', 'safe', 'suspicious', 'scam'],
        default: 'pending'
    },
    confidence: {
        type: Number, // Percentage 0-100
        default: 0
    },
    explanation: {
        type: String, // The 2-sentence explanation in the user's language
        default: ''
    },
    audioUrl: {          
        type: String,
        default: ''
    },
    detectionStage: {
        type: String,
        enum: ['pending', 'rule', 'ai'],
        default: 'pending'
    },
    language: {
        type: String,
        default: 'hi'
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Check', checkSchema);  