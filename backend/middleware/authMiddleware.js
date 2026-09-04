const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    // Check if the authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token from the header (Format: "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach the user's ID and role to the request object
            req.user = {
                id: decoded.id,
                role: decoded.role
            };

            next(); // Move to the actual route controller
        } catch (error) {
            console.error(error);
            return res.status(401).json({ error: 'Not authorized, token failed or expired' });
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token provided' });
    }
};

module.exports = { protect };