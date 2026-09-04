const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['primary', 'guardian', 'admin'],
        default: 'primary' // Assumes older user checking messages by default
    },
    preferredLanguage: {
        type: String,
        default: 'hi' // Defaulting to Hindi/regional for the target demographic
    },
    guardians: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    linkedPrimaries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    accessibilityMode: {
        type: Boolean,
        default: true // High contrast & 18px+ default, per your requirements
    },
    pushSubscription: {
        type: Object // Will hold the PWA Web Push keys later
    },
    otp: { 
        type: String 
    },
    otpExpiry: { 
        type: Date 
    }
}, { 
    
    timestamps: true // Automatically adds createdAt and updatedAt dates
});

module.exports = mongoose.model('User', userSchema);