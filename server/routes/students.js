const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { verifyToken, isStaff } = require('../middleware/auth');

const router = express.Router();

// Get all students (staff only)
router.get('/', verifyToken, isStaff, async (req, res, next) => {
    try {
        const { search, status, fee_status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT s.*, c.name as course_name, b.name as batch_name FROM students s LEFT JOIN courses c ON s.course_id = c.id LEFT JOIN batches b ON s.batch_id = b.id WHERE 1=1';
        const params = [];

        if (search) { query += ' AND (s.full_name LIKE ? OR s.email LIKE ? OR s.enrollment_number LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
        if (status && status !== 'all') { query += ' AND s.status = ?'; params.push(status); }
        if (fee_status && fee_status !== 'all') { query += ' AND s.fee_status = ?'; params.push(fee_status); }

        const countQuery = query.replace('SELECT s.*, c.name as course_name, b.name as batch_name', 'SELECT COUNT(*) as total');
        const [countResult] = await db.execute(countQuery, params);
        const total = countResult[0].total;

        query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        const [students] = await db.execute(query, params);

        res.json({ data: students.map(s => ({ ...s, courses: s.course_name ? { name: s.course_name } : null, batches: s.batch_name ? { name: s.batch_name } : null })), total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
    } catch (error) { next(error); }
});

// Get student by ID
router.get('/:id', verifyToken, async (req, res, next) => {
    try {
        const [students] = await db.execute('SELECT s.*, c.name as course_name, b.name as batch_name FROM students s LEFT JOIN courses c ON s.course_id = c.id LEFT JOIN batches b ON s.batch_id = b.id WHERE s.id = ?', [req.params.id]);
        if (students.length === 0) return res.status(404).json({ error: 'Student not found' });
        const student = students[0];
        const isOwner = student.user_id === req.user.id;
        const isStaffMember = req.user.roles.some(r => ['admin', 'director', 'faculty'].includes(r));
        if (!isOwner && !isStaffMember) return res.status(403).json({ error: 'Access denied' });
        res.json({ ...student, courses: student.course_name ? { name: student.course_name } : null, batches: student.batch_name ? { name: student.batch_name } : null });
    } catch (error) { next(error); }
});

// Create student
router.post('/', verifyToken, isStaff, async (req, res, next) => {
    try {
        const { enrollment_number, full_name, email, phone, address, date_of_birth, guardian_name, guardian_phone, course_id, batch_id, status = 'active', total_fee = 0, notes } = req.body;
        if (!enrollment_number || !full_name || !email) return res.status(400).json({ error: 'Enrollment number, name, and email are required' });

        const id = uuidv4();
        await db.execute('INSERT INTO students (id, enrollment_number, full_name, email, phone, address, date_of_birth, guardian_name, guardian_phone, course_id, batch_id, status, total_fee, paid_fee, fee_status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, \'pending\', ?, NOW(), NOW())', [id, enrollment_number, full_name, email, phone || null, address || null, date_of_birth || null, guardian_name || null, guardian_phone || null, course_id || null, batch_id || null, status, total_fee, notes || null]);
        const [students] = await db.execute('SELECT * FROM students WHERE id = ?', [id]);
        res.status(201).json(students[0]);
    } catch (error) { next(error); }
});

// Update student
router.put('/:id', verifyToken, isStaff, async (req, res, next) => {
    try {
        const { enrollment_number, full_name, email, phone, address, date_of_birth, guardian_name, guardian_phone, course_id, batch_id, status, total_fee, notes } = req.body;
        await db.execute('UPDATE students SET enrollment_number = COALESCE(?, enrollment_number), full_name = COALESCE(?, full_name), email = COALESCE(?, email), phone = ?, address = ?, date_of_birth = ?, guardian_name = ?, guardian_phone = ?, course_id = ?, batch_id = ?, status = COALESCE(?, status), total_fee = COALESCE(?, total_fee), notes = ?, updated_at = NOW() WHERE id = ?', [enrollment_number, full_name, email, phone, address, date_of_birth, guardian_name, guardian_phone, course_id, batch_id, status, total_fee, notes, req.params.id]);
        const [students] = await db.execute('SELECT * FROM students WHERE id = ?', [req.params.id]);
        if (students.length === 0) return res.status(404).json({ error: 'Student not found' });
        res.json(students[0]);
    } catch (error) { next(error); }
});

// Delete student
router.delete('/:id', verifyToken, isStaff, async (req, res, next) => {
    try {
        const [result] = await db.execute('DELETE FROM students WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found' });
        res.json({ message: 'Student deleted successfully' });
    } catch (error) { next(error); }
});

module.exports = router;
