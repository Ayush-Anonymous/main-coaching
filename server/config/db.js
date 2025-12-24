const mysql = require('mysql2/promise');

// Hostinger MySQL configuration with HARDCODED FALLBACKS
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

let pool = null;
let isConnected = false;

async function initDatabase() {
    try {
        pool = mysql.createPool(DB_CONFIG);
        const connection = await pool.getConnection();
        console.log('✅ MySQL connected successfully');
        connection.release();
        isConnected = true;
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
        isConnected = false;
    }
}

// Initialize on require
initDatabase();

// Export pool and connection status
module.exports = {
    execute: async (...args) => {
        if (!pool) {
            throw new Error('Database not initialized');
        }
        return pool.execute(...args);
    },
    query: async (...args) => {
        if (!pool) {
            throw new Error('Database not initialized');
        }
        return pool.query(...args);
    },
    getPool: () => pool,
    get isConnected() {
        return isConnected;
    }
};
