/**
 * Institute Compass - Hostinger Production-Ready Express Server
 * Entry Point: server.js at root level
 * Pattern matched from working FRESH TESTING app
 */

// Only load dotenv in development (Hostinger uses dashboard ENV)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

const app = express();

// Hostinger injects PORT
const PORT = process.env.PORT || 3000;

// ==================== DEBUG LOGS ====================
console.log('========== ENV DEBUG ==========');
console.log('PORT:', process.env.PORT || '3000 (fallback)');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'LOADED ✅' : 'NOT LOADED ❌');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('CWD:', process.cwd());
console.log('__dirname:', __dirname);
console.log('===============================');

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist folder
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Database connection pool
let pool = null;
let dbConnected = false;

async function initDatabase() {
    // HARDCODED FALLBACKS for Hostinger (ENV may not work)
    const DB_CONFIG = {
        host: process.env.DB_HOST || 'srv1833.hstgr.io',
        user: process.env.DB_USER || 'u662005344_manbahadur',
        password: process.env.DB_PASSWORD || 'nEwdata@22',
        database: process.env.DB_NAME || 'u662005344_shanbahadur',
        port: Number(process.env.DB_PORT) || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };

    console.log('🔧 Using DB Config:', {
        host: DB_CONFIG.host,
        user: DB_CONFIG.user,
        database: DB_CONFIG.database,
        password: DB_CONFIG.password ? '***SET***' : 'EMPTY'
    });

    try {
        pool = mysql.createPool(DB_CONFIG);
        const connection = await pool.getConnection();
        console.log('✅ MySQL connected successfully');
        connection.release();
        dbConnected = true;
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
        dbConnected = false;
        // Don't crash - allow server to start without DB
    }
}

// Health Check Endpoint
app.get('/health', (req, res) => {
    const distIndexPath = path.join(distPath, 'index.html');
    res.json({
        status: 'SERVER ALIVE',
        timestamp: new Date().toISOString(),
        database: dbConnected ? 'connected' : 'disconnected',
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

// Export pool for routes
const getPool = () => pool;
const isDbConnected = () => dbConnected;

// API Routes - inline requires with pool passed
app.use('/api/auth', (req, res, next) => { req.pool = pool; next(); }, require('./server/routes/auth'));
app.use('/api/students', (req, res, next) => { req.pool = pool; next(); }, require('./server/routes/students'));
app.use('/api/courses', (req, res, next) => { req.pool = pool; next(); }, require('./server/routes/courses'));
app.use('/api/batches', (req, res, next) => { req.pool = pool; next(); }, require('./server/routes/batches'));
app.use('/api/faculty', (req, res, next) => { req.pool = pool; next(); }, require('./server/routes/faculty'));
app.use('/api/fees', (req, res, next) => { req.pool = pool; next(); }, require('./server/routes/fees'));
app.use('/api/enquiries', (req, res, next) => { req.pool = pool; next(); }, require('./server/routes/enquiries'));
app.use('/api/tests', (req, res, next) => { req.pool = pool; next(); }, require('./server/routes/tests'));
app.use('/api/settings', (req, res, next) => { req.pool = pool; next(); }, require('./server/routes/settings'));
app.use('/api/users', (req, res, next) => { req.pool = pool; next(); }, require('./server/routes/users'));

// Error handling middleware
app.use(require('./server/middleware/errorHandler'));

// Catch-all for SPA (send index.html for any unmatched routes)
app.get('*', (req, res) => {
    const distIndexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(distIndexPath)) {
        res.sendFile(distIndexPath);
    } else {
        res.status(500).send('<h1>Build Not Found</h1><p>dist/index.html missing</p>');
    }
});

// ==================== START SERVER ====================
async function startServer() {
    await initDatabase();

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`
╔════════════════════════════════════════════╗
║     🚀 INSTITUTE COMPASS SERVER RUNNING    ║
╠════════════════════════════════════════════╣
║  Port: ${PORT}                               
║  Database: ${dbConnected ? '✅ Connected' : '❌ Not Connected'}        
╚════════════════════════════════════════════╝
        `);
    });
}

startServer();

module.exports = { app, getPool, isDbConnected };
