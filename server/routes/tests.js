const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { verifyToken, isStaff } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, async (req, res, next) => {
    try {
        const { course_id, batch_id } = req.query;
        const isStaffMember = req.user.roles.some(r => ['admin', 'director', 'faculty'].includes(r));
        let query = 'SELECT t.*, c.name as course_name, b.name as batch_name FROM tests t LEFT JOIN courses c ON t.course_id = c.id LEFT JOIN batches b ON t.batch_id = b.id WHERE 1=1';
        const params = [];
        if (!isStaffMember) query += ' AND t.is_active = 1';
        if (course_id) { query += ' AND t.course_id = ?'; params.push(course_id); }
        if (batch_id) { query += ' AND t.batch_id = ?'; params.push(batch_id); }
        query += ' ORDER BY t.test_date DESC, t.created_at DESC';
        const [tests] = await db.execute(query, params);
        res.json({ data: tests.map(t => ({ ...t, courses: t.course_name ? { name: t.course_name } : null, batches: t.batch_name ? { name: t.batch_name } : null })) });
    } catch (error) { next(error); }
});

router.post('/', verifyToken, isStaff, async (req, res, next) => {
    try {
        const { name, course_id, batch_id, max_marks = 100, passing_marks = 40, test_date, description, is_active = true } = req.body;
        if (!name) return res.status(400).json({ error: 'Test name is required' });
        const id = uuidv4();
        await db.execute('INSERT INTO tests (id, name, course_id, batch_id, max_marks, passing_marks, test_date, description, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())', [id, name, course_id || null, batch_id || null, max_marks, passing_marks, test_date || null, description || null, is_active]);
        const [tests] = await db.execute('SELECT * FROM tests WHERE id = ?', [id]);
        res.status(201).json(tests[0]);
    } catch (error) { next(error); }
});

router.put('/:id', verifyToken, isStaff, async (req, res, next) => {
    try {
        const { name, course_id, batch_id, max_marks, passing_marks, test_date, description, is_active } = req.body;
        await db.execute('UPDATE tests SET name = COALESCE(?, name), course_id = ?, batch_id = ?, max_marks = COALESCE(?, max_marks), passing_marks = COALESCE(?, passing_marks), test_date = ?, description = ?, is_active = COALESCE(?, is_active), updated_at = NOW() WHERE id = ?', [name, course_id, batch_id, max_marks, passing_marks, test_date, description, is_active, req.params.id]);
        const [tests] = await db.execute('SELECT * FROM tests WHERE id = ?', [req.params.id]);
        if (tests.length === 0) return res.status(404).json({ error: 'Test not found' });
        res.json(tests[0]);
    } catch (error) { next(error); }
});

router.delete('/:id', verifyToken, isStaff, async (req, res, next) => {
    try {
        const [result] = await db.execute('DELETE FROM tests WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Test not found' });
        res.json({ message: 'Test deleted successfully' });
    } catch (error) { next(error); }
});

router.get('/:testId/marks', verifyToken, async (req, res, next) => {
    try {
        const isStaffMember = req.user.roles.some(r => ['admin', 'director', 'faculty'].includes(r));
        let query = 'SELECT m.*, s.full_name as student_name, s.enrollment_number FROM marks m JOIN students s ON m.student_id = s.id WHERE m.test_id = ?';
        const params = [req.params.testId];
        if (!isStaffMember) { query += ' AND s.user_id = ?'; params.push(req.user.id); }
        const [marks] = await db.execute(query, params);
        res.json({ data: marks });
    } catch (error) { next(error); }
});

router.post('/:testId/marks', verifyToken, isStaff, async (req, res, next) => {
    try {
        const { student_id, marks_obtained, remarks } = req.body;
        if (!student_id || marks_obtained === undefined) return res.status(400).json({ error: 'Student ID and marks are required' });
        const [existing] = await db.execute('SELECT id FROM marks WHERE student_id = ? AND test_id = ?', [student_id, req.params.testId]);
        if (existing.length > 0) {
            await db.execute('UPDATE marks SET marks_obtained = ?, remarks = ?, updated_at = NOW() WHERE id = ?', [marks_obtained, remarks || null, existing[0].id]);
        } else {
            await db.execute('INSERT INTO marks (id, student_id, test_id, marks_obtained, remarks, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())', [uuidv4(), student_id, req.params.testId, marks_obtained, remarks || null]);
        }
        const [marks] = await db.execute('SELECT * FROM marks WHERE student_id = ? AND test_id = ?', [student_id, req.params.testId]);
        res.json(marks[0]);
    } catch (error) { next(error); }
});

module.exports = router;
