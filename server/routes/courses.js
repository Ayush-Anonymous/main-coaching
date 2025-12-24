const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { verifyToken, isStaff, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const isStaffMember = req.user?.roles?.some(r => ['admin', 'director', 'faculty'].includes(r));
        let query = 'SELECT * FROM courses' + (isStaffMember ? '' : ' WHERE is_active = 1') + ' ORDER BY created_at DESC';
        const [courses] = await db.execute(query);
        res.json({ data: courses });
    } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
    try {
        const [courses] = await db.execute('SELECT * FROM courses WHERE id = ?', [req.params.id]);
        if (courses.length === 0) return res.status(404).json({ error: 'Course not found' });
        res.json(courses[0]);
    } catch (error) { next(error); }
});

router.post('/', verifyToken, isStaff, async (req, res, next) => {
    try {
        const { name, description, duration_months = 12, fee_amount = 0, image_url, is_active = true } = req.body;
        if (!name) return res.status(400).json({ error: 'Course name is required' });
        const id = uuidv4();
        await db.execute('INSERT INTO courses (id, name, description, duration_months, fee_amount, image_url, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())', [id, name, description || null, duration_months, fee_amount, image_url || null, is_active]);
        const [courses] = await db.execute('SELECT * FROM courses WHERE id = ?', [id]);
        res.status(201).json(courses[0]);
    } catch (error) { next(error); }
});

router.put('/:id', verifyToken, isStaff, async (req, res, next) => {
    try {
        const { name, description, duration_months, fee_amount, image_url, is_active } = req.body;
        await db.execute('UPDATE courses SET name = COALESCE(?, name), description = ?, duration_months = COALESCE(?, duration_months), fee_amount = COALESCE(?, fee_amount), image_url = ?, is_active = COALESCE(?, is_active), updated_at = NOW() WHERE id = ?', [name, description, duration_months, fee_amount, image_url, is_active, req.params.id]);
        const [courses] = await db.execute('SELECT * FROM courses WHERE id = ?', [req.params.id]);
        if (courses.length === 0) return res.status(404).json({ error: 'Course not found' });
        res.json(courses[0]);
    } catch (error) { next(error); }
});

router.delete('/:id', verifyToken, isStaff, async (req, res, next) => {
    try {
        const [result] = await db.execute('DELETE FROM courses WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Course not found' });
        res.json({ message: 'Course deleted successfully' });
    } catch (error) { next(error); }
});

module.exports = router;
