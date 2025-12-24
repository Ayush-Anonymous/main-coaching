const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'institute-compass-super-secret-jwt-key-2024';

// Verify JWT token middleware
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const [users] = await db.execute('SELECT id, email, full_name FROM profiles WHERE id = ?', [decoded.userId]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        const [roles] = await db.execute('SELECT role FROM user_roles WHERE user_id = ?', [decoded.userId]);
        req.user = { ...users[0], roles: roles.map(r => r.role) };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired' });
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Invalid token' });
        console.error('Auth error:', error);
        return res.status(500).json({ error: 'Authentication failed' });
    }
};

// Check if user is staff
const isStaff = (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const staffRoles = ['admin', 'director', 'faculty'];
    if (!req.user.roles.some(role => staffRoles.includes(role))) {
        return res.status(403).json({ error: 'Access denied. Staff only.' });
    }
    next();
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!req.user.roles.includes('admin')) {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
};

// Optional auth
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = null;
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const [users] = await db.execute('SELECT id, email, full_name FROM profiles WHERE id = ?', [decoded.userId]);

        if (users.length > 0) {
            const [roles] = await db.execute('SELECT role FROM user_roles WHERE user_id = ?', [decoded.userId]);
            req.user = { ...users[0], roles: roles.map(r => r.role) };
        } else {
            req.user = null;
        }
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

module.exports = { verifyToken, isStaff, isAdmin, optionalAuth, JWT_SECRET };
