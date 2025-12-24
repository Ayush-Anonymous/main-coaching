const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, isAdmin, async (req, res, next) => {
    try {
        const [users] = await db.execute('SELECT p.id, p.email, p.full_name, p.avatar_url, p.phone, p.created_at FROM profiles p ORDER BY p.created_at DESC');
        for (const user of users) {
            const [roles] = await db.execute('SELECT role FROM user_roles WHERE user_id = ?', [user.id]);
            user.roles = roles.map(r => r.role);
        }
        res.json({ data: users });
    } catch (error) { next(error); }
});

router.get('/:id/roles', verifyToken, async (req, res, next) => {
    try {
        if (req.params.id !== req.user.id && !req.user.roles.includes('admin')) return res.status(403).json({ error: 'Access denied' });
        const [roles] = await db.execute('SELECT role FROM user_roles WHERE user_id = ?', [req.params.id]);
        res.json({ roles: roles.map(r => r.role) });
    } catch (error) { next(error); }
});

router.post('/:id/roles', verifyToken, isAdmin, async (req, res, next) => {
    try {
        const { role } = req.body;
        if (!role) return res.status(400).json({ error: 'Role is required' });
        if (!['admin', 'director', 'faculty', 'student'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
        const [existing] = await db.execute('SELECT id FROM user_roles WHERE user_id = ? AND role = ?', [req.params.id, role]);
        if (existing.length > 0) return res.status(409).json({ error: 'User already has this role' });
        await db.execute('INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)', [uuidv4(), req.params.id, role]);
        const [roles] = await db.execute('SELECT role FROM user_roles WHERE user_id = ?', [req.params.id]);
        res.status(201).json({ roles: roles.map(r => r.role) });
    } catch (error) { next(error); }
});

router.delete('/:id/roles/:role', verifyToken, isAdmin, async (req, res, next) => {
    try {
        const [result] = await db.execute('DELETE FROM user_roles WHERE user_id = ? AND role = ?', [req.params.id, req.params.role]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Role not found for this user' });
        const [roles] = await db.execute('SELECT role FROM user_roles WHERE user_id = ?', [req.params.id]);
        res.json({ roles: roles.map(r => r.role) });
    } catch (error) { next(error); }
});

module.exports = router;
