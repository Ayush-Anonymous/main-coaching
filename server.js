/**
 * Institute Compass - Hostinger Production-Ready Express Server
 * Entry Point: server.js at root level
 * Uses CommonJS for Hostinger compatibility
 */

// Always load dotenv (it won't override Hostinger env vars)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Hostinger injects PORT, fallback for local dev
const PORT = process.env.PORT || 3000;

// ==================== DEBUG LOGS ====================
console.log('========== ENV DEBUG ==========');
console.log('PORT:', process.env.PORT || '3000 (fallback)');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CWD:', process.cwd());
console.log('__dirname:', __dirname);

// Check if dist exists
const distPath = path.join(__dirname, 'dist');
const distIndexPath = path.join(distPath, 'index.html');
console.log('Dist path:', distPath);
console.log('Dist exists:', fs.existsSync(distPath));
console.log('Dist index.html exists:', fs.existsSync(distIndexPath));
if (fs.existsSync(distPath)) {
    console.log('Dist contents:', fs.readdirSync(distPath));
}
console.log('===============================');

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist folder
app.use(express.static(distPath));

// Health Check Endpoint
app.get('/health', (req, res) => {
    const db = require('./server/config/db');
    res.json({
        status: 'SERVER ALIVE',
        timestamp: new Date().toISOString(),
        database: db.isConnected ? 'connected' : 'checking...',
        distExists: fs.existsSync(distPath),
        distIndexExists: fs.existsSync(distIndexPath),
        env: {
            DB_HOST: process.env.DB_HOST ? 'SET' : 'NOT SET',
            DB_USER: process.env.DB_USER ? 'SET' : 'NOT SET',
            DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'NOT SET',
            DB_NAME: process.env.DB_NAME ? 'SET' : 'NOT SET'
        }
    });
});

// API Routes
app.use('/api/auth', require('./server/routes/auth'));
app.use('/api/students', require('./server/routes/students'));
app.use('/api/courses', require('./server/routes/courses'));
app.use('/api/batches', require('./server/routes/batches'));
app.use('/api/faculty', require('./server/routes/faculty'));
app.use('/api/fees', require('./server/routes/fees'));
app.use('/api/enquiries', require('./server/routes/enquiries'));
app.use('/api/tests', require('./server/routes/tests'));
app.use('/api/settings', require('./server/routes/settings'));
app.use('/api/users', require('./server/routes/users'));

// Error handling middleware
app.use(require('./server/middleware/errorHandler'));

// Catch-all for SPA (send index.html for any unmatched routes)
app.get('*', (req, res) => {
    if (fs.existsSync(distIndexPath)) {
        res.sendFile(distIndexPath);
    } else {
        res.status(500).send(`
            <h1>Build Not Found</h1>
            <p>The dist/index.html file is missing.</p>
            <p>Please run: npm run client:build</p>
            <p>Dist path: ${distPath}</p>
            <p>Exists: ${fs.existsSync(distPath)}</p>
        `);
    }
});

// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════════╗
║     🚀 INSTITUTE COMPASS SERVER RUNNING    ║
╠════════════════════════════════════════════╣
║  Port: ${PORT}                               
║  Health: http://localhost:${PORT}/health        
╚════════════════════════════════════════════╝
    `);
});

module.exports = app;
