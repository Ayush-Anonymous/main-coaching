const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { verifyToken, isStaff } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const [settings] = await db.execute('SELECT * FROM settings');
        const settingsObj = {};
        settings.forEach(s => { settingsObj[s.key] = typeof s.value === 'string' ? JSON.parse(s.value) : s.value; });
        res.json({ data: settingsObj, raw: settings });
    } catch (error) { next(error); }
});

router.get('/:key', async (req, res, next) => {
    try {
        const [settings] = await db.execute('SELECT * FROM settings WHERE `key` = ?', [req.params.key]);
        if (settings.length === 0) return res.status(404).json({ error: 'Setting not found' });
        const setting = settings[0];
        res.json({ ...setting, value: typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value });
    } catch (error) { next(error); }
});

router.put('/:key', verifyToken, isStaff, async (req, res, next) => {
    try {
        const { value, description } = req.body;
        if (value === undefined) return res.status(400).json({ error: 'Value is required' });
        const valueStr = JSON.stringify(value);
        const [existing] = await db.execute('SELECT id FROM settings WHERE `key` = ?', [req.params.key]);
        if (existing.length > 0) {
            await db.execute('UPDATE settings SET value = ?, description = COALESCE(?, description), updated_at = NOW() WHERE `key` = ?', [valueStr, description, req.params.key]);
        } else {
            await db.execute('INSERT INTO settings (id, `key`, value, description, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())', [uuidv4(), req.params.key, valueStr, description || null]);
        }
        const [settings] = await db.execute('SELECT * FROM settings WHERE `key` = ?', [req.params.key]);
        res.json({ ...settings[0], value: JSON.parse(settings[0].value) });
    } catch (error) { next(error); }
});

module.exports = router;
