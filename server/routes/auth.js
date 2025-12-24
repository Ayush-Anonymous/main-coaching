const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res, next) => {
    try {
        const { email, password, full_name } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

        const [existing] = await db.execute('SELECT id FROM profiles WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(409).json({ error: 'User already exists' });

        const password_hash = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        await db.execute('INSERT INTO profiles (id, email, full_name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())', [userId, email, full_name || email, password_hash]);
        await db.execute('INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)', [uuidv4(), userId, 'student']);

        const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
        const [users] = await db.execute('SELECT id, email, full_name, avatar_url, phone, created_at FROM profiles WHERE id = ?', [userId]);

        res.status(201).json({ user: users[0], token, message: 'User registered successfully' });
    } catch (error) { next(error); }
});

// Login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

        const [users] = await db.execute('SELECT id, email, full_name, avatar_url, phone, password_hash FROM profiles WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const [roles] = await db.execute('SELECT role FROM user_roles WHERE user_id = ?', [user.id]);
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        delete user.password_hash;

        res.json({ user: { ...user, roles: roles.map(r => r.role) }, token });
    } catch (error) { next(error); }
});

// Get current user
router.get('/me', verifyToken, async (req, res, next) => {
    try {
        const [users] = await db.execute('SELECT id, email, full_name, avatar_url, phone, created_at, updated_at FROM profiles WHERE id = ?', [req.user.id]);
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });

        const [roles] = await db.execute('SELECT role FROM user_roles WHERE user_id = ?', [req.user.id]);
        res.json({ user: { ...users[0], roles: roles.map(r => r.role) } });
    } catch (error) { next(error); }
});

// Update profile
router.put('/profile', verifyToken, async (req, res, next) => {
    try {
        const { full_name, phone, avatar_url } = req.body;
        await db.execute('UPDATE profiles SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone), avatar_url = COALESCE(?, avatar_url), updated_at = NOW() WHERE id = ?', [full_name, phone, avatar_url, req.user.id]);
        const [users] = await db.execute('SELECT id, email, full_name, avatar_url, phone FROM profiles WHERE id = ?', [req.user.id]);
        res.json({ user: users[0] });
    } catch (error) { next(error); }
});

// Change password
router.put('/password', verifyToken, async (req, res, next) => {
    try {
        const { current_password, new_password } = req.body;
        if (!current_password || !new_password) return res.status(400).json({ error: 'Current and new password are required' });

        const [users] = await db.execute('SELECT password_hash FROM profiles WHERE id = ?', [req.user.id]);
        const isMatch = await bcrypt.compare(current_password, users[0].password_hash);
        if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });

        const password_hash = await bcrypt.hash(new_password, 10);
        await db.execute('UPDATE profiles SET password_hash = ?, updated_at = NOW() WHERE id = ?', [password_hash, req.user.id]);
        res.json({ message: 'Password updated successfully' });
    } catch (error) { next(error); }
});

// Logout
router.post('/logout', verifyToken, (req, res) => res.json({ message: 'Logged out successfully' }));

module.exports = router;
