const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { verifyToken, isStaff } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, isStaff, async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM enquiries WHERE 1=1';
        const params = [];
        if (status && status !== 'all') { query += ' AND status = ?'; params.push(status); }
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const [countResult] = await db.execute(countQuery, params);
        const total = countResult[0].total;
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        const [enquiries] = await db.execute(query, params);
        res.json({ data: enquiries, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
    } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
    try {
        const { name, email, phone, course_interest, message } = req.body;
        if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
        const id = uuidv4();
        await db.execute('INSERT INTO enquiries (id, name, email, phone, course_interest, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, \'new\', NOW())', [id, name, email, phone || null, course_interest || null, message || null]);
        res.status(201).json({ message: 'Enquiry submitted successfully', id });
    } catch (error) { next(error); }
});

router.put('/:id', verifyToken, isStaff, async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ error: 'Status is required' });
        await db.execute('UPDATE enquiries SET status = ? WHERE id = ?', [status, req.params.id]);
        const [enquiries] = await db.execute('SELECT * FROM enquiries WHERE id = ?', [req.params.id]);
        if (enquiries.length === 0) return res.status(404).json({ error: 'Enquiry not found' });
        res.json(enquiries[0]);
    } catch (error) { next(error); }
});

router.delete('/:id', verifyToken, isStaff, async (req, res, next) => {
    try {
        const [result] = await db.execute('DELETE FROM enquiries WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Enquiry not found' });
        res.json({ message: 'Enquiry deleted successfully' });
    } catch (error) { next(error); }
});

module.exports = router;
