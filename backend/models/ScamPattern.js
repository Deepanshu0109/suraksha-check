const mongoose = require('mongoose');

const scamPatternSchema = new mongoose.Schema({
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