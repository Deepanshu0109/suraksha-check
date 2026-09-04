const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to match WhatsApp's phone format
const normalizePhone = (phone) => {
    let cleaned = phone.toString().replace(/\D/g, '');
    // If it's exactly 10 digits, assume India and prepend 91
    if (cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }
    return cleaned;
};

// Generate and send OTP
// Generate and send OTP
exports.requestOtp = async (req, res) => {
    const { phone, mode } = req.body; 
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    const normalizedPhone = normalizePhone(phone);

    try {
        let user = await User.findOne({ phone: normalizedPhone });

        // STRICT ROLE CHECKS
        // 1. Prevent registering an already verified account
        // NEW FIX: Only block if they ALSO have a name (meaning they aren't a ghost account)
        if (mode === 'register' && user && user.otp === undefined && user.name) {
            return res.status(400).json({ error: 'This number is already registered. Please switch to Log In.' });
        }
        // 2. Prevent logging in to an account that doesn't exist
        if (mode === 'login' && !user) {
            return res.status(400).json({ error: 'Account not found. Please create an account first.' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60000);

        if (!user) {
            user = new User({ phone: normalizedPhone, otp, otpExpiry });
        } else {
            user.otp = otp;
            user.otpExpiry = otpExpiry;
        }
        await user.save();

        console.log(`\n[MOCK SMS] -> OTP for ${normalizedPhone} is: ${otp}\n`);
        res.status(200).json({ message: 'OTP generated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during OTP generation' });
    }
};

// Verify OTP and issue JWT
exports.verifyOtp = async (req, res) => {
    const { phone, otp, name, role } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP are required' });

    const normalizedPhone = normalizePhone(phone);

    try {
        const user = await User.findOne({ phone: normalizedPhone });
        
        if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }
        
        // Update role and name if provided from the frontend
        if (role && ['primary', 'guardian', 'admin'].includes(role)) {
            user.role = role;
        }
        if (name) {
            user.name = name;
        }

        // Clear OTP after successful login
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        // Issue token with the updated role
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '30d' } 
        );

        res.status(200).json({ token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during verification' });
    }
};

// Fetch the current logged-in user's profile safely
exports.getProfile = async (req, res) => {
    try {
        // req.user.id comes from your protect middleware
        const user = await User.findById(req.user.id).select('-otp -otpExpiry');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
};