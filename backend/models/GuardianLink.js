const mongoose = require('mongoose');

const guardianLinkSchema = new mongoose.Schema({
    primaryUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    guardianUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'revoked'],
        default: 'pending' // Guardian is not active until primary consents
    },
    shareFullContent: {
        type: Boolean,
        default: false // Enforces the non-surveillance rule by default
    },
    alertThreshold: {
        type: String,
        enum: ['all', 'scam_only'],
        default: 'scam_only' // Prevents notification spam for guardians
    }
}, { 
    timestamps: true 
});

// Prevent a guardian from being linked to the same primary user twice
guardianLinkSchema.index({ primaryUser: 1, guardianUser: 1 }, { unique: true });

module.exports = mongoose.model('GuardianLink', guardianLinkSchema);