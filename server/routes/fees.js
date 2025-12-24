const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { verifyToken, isStaff } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, isStaff, async (req, res, next) => {
    try {
        const { student_id, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        let query = 'SELECT fp.*, s.full_name as student_name, s.enrollment_number FROM fee_payments fp JOIN students s ON fp.student_id = s.id WHERE 1=1';
        const params = [];
        if (student_id) { query += ' AND fp.student_id = ?'; params.push(student_id); }
        const countQuery = query.replace('SELECT fp.*, s.full_name as student_name, s.enrollment_number', 'SELECT COUNT(*) as total');
        const [countResult] = await db.execute(countQuery, params);
        const total = countResult[0].total;
        query += ' ORDER BY fp.payment_date DESC, fp.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        const [payments] = await db.execute(query, params);
        res.json({ data: payments, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
    } catch (error) { next(error); }
});

router.post('/', verifyToken, isStaff, async (req, res, next) => {
    try {
        const { student_id, amount, payment_date, payment_method, receipt_number, notes } = req.body;
        if (!student_id || !amount) return res.status(400).json({ error: 'Student ID and amount are required' });
        const id = uuidv4();
        await db.execute('INSERT INTO fee_payments (id, student_id, amount, payment_date, payment_method, receipt_number, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())', [id, student_id, amount, payment_date || new Date().toISOString().split('T')[0], payment_method || null, receipt_number || null, notes || null]);
        await db.execute('UPDATE students SET paid_fee = paid_fee + ?, fee_status = CASE WHEN paid_fee + ? >= total_fee THEN \'paid\' WHEN paid_fee + ? > 0 THEN \'partial\' ELSE fee_status END, updated_at = NOW() WHERE id = ?', [amount, amount, amount, student_id]);
        const [payments] = await db.execute('SELECT * FROM fee_payments WHERE id = ?', [id]);
        res.status(201).json(payments[0]);
    } catch (error) { next(error); }
});

router.delete('/:id', verifyToken, isStaff, async (req, res, next) => {
    try {
        const [payments] = await db.execute('SELECT * FROM fee_payments WHERE id = ?', [req.params.id]);
        if (payments.length === 0) return res.status(404).json({ error: 'Payment not found' });
        const payment = payments[0];
        await db.execute('DELETE FROM fee_payments WHERE id = ?', [req.params.id]);
        await db.execute('UPDATE students SET paid_fee = paid_fee - ?, fee_status = CASE WHEN paid_fee - ? <= 0 THEN \'pending\' WHEN paid_fee - ? < total_fee THEN \'partial\' ELSE fee_status END, updated_at = NOW() WHERE id = ?', [payment.amount, payment.amount, payment.amount, payment.student_id]);
        res.json({ message: 'Payment deleted successfully' });
    } catch (error) { next(error); }
});

module.exports = router;
