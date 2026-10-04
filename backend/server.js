require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/whatsapp', require('./routes/whatsappRoutes'));
app.use('/api/guardians', require('./routes/guardianRoutes'));
app.use('/api/checks', require('./routes/checkRoutes'));
app.use('/api/admin', adminRoutes);

// Basic Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'active',
        message: 'SurakshaCheck API is running'
    });
});

// Connect to MongoDB
connectDB();

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});