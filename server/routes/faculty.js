const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { verifyToken, isStaff, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const isStaffMember = req.user?.roles?.some(r => ['admin', 'director', 'faculty'].includes(r));
        let query = 'SELECT * FROM faculty' + (isStaffMember ? '' : ' WHERE is_active = 1') + ' ORDER BY created_at DESC';
        const [faculty] = await db.execute(query);
        res.json({ data: faculty });
    } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
    try {
        const [faculty] = await db.execute('SELECT * FROM faculty WHERE id = ?', [req.params.id]);
        if (faculty.length === 0) return res.status(404).json({ error: 'Faculty not found' });
        res.json(faculty[0]);
    } catch (error) { next(error); }
});

router.post('/', verifyToken, isStaff, async (req, res, next) => {
    try {
        const { full_name, email, phone, qualification, specialization, experience_years = 0, joining_date, salary = 0, address, is_active = true, bio, avatar_url } = req.body;
        if (!full_name || !email) return res.status(400).json({ error: 'Name and email are required' });
        const id = uuidv4();
        await db.execute('INSERT INTO faculty (id, full_name, email, phone, qualification, specialization, experience_years, joining_date, salary, address, is_active, bio, avatar_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())', [id, full_name, email, phone || null, qualification || null, specialization || null, experience_years, joining_date || null, salary, address || null, is_active, bio || null, avatar_url || null]);
        const [faculty] = await db.execute('SELECT * FROM faculty WHERE id = ?', [id]);
        res.status(201).json(faculty[0]);
    } catch (error) { next(error); }
});

router.put('/:id', verifyToken, isStaff, async (req, res, next) => {
    try {
        const { full_name, email, phone, qualification, specialization, experience_years, joining_date, salary, address, is_active, bio, avatar_url } = req.body;
        await db.execute('UPDATE faculty SET full_name = COALESCE(?, full_name), email = COALESCE(?, email), phone = ?, qualification = ?, specialization = ?, experience_years = COALESCE(?, experience_years), joining_date = ?, salary = COALESCE(?, salary), address = ?, is_active = COALESCE(?, is_active), bio = ?, avatar_url = ?, updated_at = NOW() WHERE id = ?', [full_name, email, phone, qualification, specialization, experience_years, joining_date, salary, address, is_active, bio, avatar_url, req.params.id]);
        const [faculty] = await db.execute('SELECT * FROM faculty WHERE id = ?', [req.params.id]);
        if (faculty.length === 0) return res.status(404).json({ error: 'Faculty not found' });
        res.json(faculty[0]);
    } catch (error) { next(error); }
});

router.delete('/:id', verifyToken, isStaff, async (req, res, next) => {
    try {
        const [result] = await db.execute('DELETE FROM faculty WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Faculty not found' });
        res.json({ message: 'Faculty deleted successfully' });
    } catch (error) { next(error); }
});

module.exports = router;
