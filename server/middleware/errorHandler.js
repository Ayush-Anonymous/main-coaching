// Global error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // MySQL errors
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Duplicate entry', message: 'A record with this value already exists' });
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ error: 'Invalid reference', message: 'Referenced record does not exist' });
    }
    if (err.code === 'ECONNREFUSED') {
        return res.status(503).json({ error: 'Database unavailable', message: 'Unable to connect to database' });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token', message: 'Authentication failed' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired', message: 'Please login again' });
    }

    // Default error
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;
