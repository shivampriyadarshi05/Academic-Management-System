// authMiddleware.js — JWT Verification Middleware
// This middleware checks if the user is logged in by verifying
// the JWT token sent in the request header.
//
// HOW IT WORKS:
// 1. Frontend sends a request with header: Authorization: Bearer <token>
// 2. This middleware extracts the token from the header
// 3. It verifies the token using the JWT_SECRET
// 4. If valid, it attaches the user info to req.user
// 5. If invalid or missing, it sends a 401 (Unauthorized) response

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
 
    const authHeader = req.headers.authorization;

    
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
    
      token = authHeader.split(' ')[1];
    } else if (req.query.token) {
    
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'No token provided. Please log in.' });
    }

    
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    
    req.user = decoded;

    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
};

module.exports = authMiddleware;
