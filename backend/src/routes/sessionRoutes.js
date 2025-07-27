const express = require('express');
const router = express.Router();
const db = require('../../sequelize/models');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db.User.findOne({ where: { email } });
    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    req.session.user = { id: user.id, name: user.name, email: user.email };
    res.json({ user: req.session.user });
});

router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ message: 'Logout realizado' });
    });
});

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const exists = await db.User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email já cadastrado' });
    const user = await db.User.create({ name, email, password });
    req.session.user = { id: user.id, name: user.name, email: user.email };
    res.json({ user: req.session.user });
});

module.exports = router;
