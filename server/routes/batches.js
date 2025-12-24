const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { verifyToken, isStaff, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const { course_id } = req.query;
        const isStaffMember = req.user?.roles?.some(r => ['admin', 'director', 'faculty'].includes(r));
        let query = 'SELECT b.*, c.name as course_name FROM batches b LEFT JOIN courses c ON b.course_id = c.id WHERE 1=1';
        const params = [];
        if (!isStaffMember) query += ' AND b.is_active = 1';
        if (course_id) { query += ' AND b.course_id = ?'; params.push(course_id); }
        query += ' ORDER BY b.created_at DESC';
        const [batches] = await db.execute(query, params);
        res.json({ data: batches.map(b => ({ ...b, courses: b.course_name ? { name: b.course_name } : null })) });
    } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
    try {
        const [batches] = await db.execute('SELECT b.*, c.name as course_name FROM batches b LEFT JOIN courses c ON b.course_id = c.id WHERE b.id = ?', [req.params.id]);
        if (batches.length === 0) return res.status(404).json({ error: 'Batch not found' });
        const batch = batches[0];
        res.json({ ...batch, courses: batch.course_name ? { name: batch.course_name } : null });
    } catch (error) { next(error); }
});

router.post('/', verifyToken, isStaff, async (req, res, next) => {
    try {
        const { name, course_id, start_date, end_date, capacity = 30, is_active = true } = req.body;
        if (!name) return res.status(400).json({ error: 'Batch name is required' });
        const id = uuidv4();
        await db.execute('INSERT INTO batches (id, name, course_id, start_date, end_date, capacity, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())', [id, name, course_id || null, start_date || null, end_date || null, capacity, is_active]);
        const [batches] = await db.execute('SELECT * FROM batches WHERE id = ?', [id]);
        res.status(201).json(batches[0]);
    } catch (error) { next(error); }
});

router.put('/:id', verifyToken, isStaff, async (req, res, next) => {
    try {
        const { name, course_id, start_date, end_date, capacity, is_active } = req.body;
        await db.execute('UPDATE batches SET name = COALESCE(?, name), course_id = ?, start_date = ?, end_date = ?, capacity = COALESCE(?, capacity), is_active = COALESCE(?, is_active) WHERE id = ?', [name, course_id, start_date, end_date, capacity, is_active, req.params.id]);
        const [batches] = await db.execute('SELECT * FROM batches WHERE id = ?', [req.params.id]);
        if (batches.length === 0) return res.status(404).json({ error: 'Batch not found' });
        res.json(batches[0]);
    } catch (error) { next(error); }
});

router.delete('/:id', verifyToken, isStaff, async (req, res, next) => {
    try {
        const [result] = await db.execute('DELETE FROM batches WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Batch not found' });
        res.json({ message: 'Batch deleted successfully' });
    } catch (error) { next(error); }
});

module.exports = router;
