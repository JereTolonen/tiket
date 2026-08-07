const express = require('express');
const db = require('../db');
const router = express.Router();

// Listaa kaikki käyttäjät
router.get('/', (req, res) => {
  const users = db.prepare('SELECT id, name, email, created_at FROM users').all();
  res.json(users);
});

// Yksittäinen käyttäjä
router.get('/:id', (req, res) => {
  const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Käyttäjää ei löytynyt' });
  res.json(user);
});

// Uusi käyttäjä
router.post('/', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email ja password ovat pakollisia' });
  }
  try {
    const result = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
      .run(name, email, password); // demo: ei oikeaa hashausta
    res.status(201).json({ id: result.lastInsertRowid, name, email });
  } catch (err) {
    res.status(400).json({ error: 'Sähköposti on jo käytössä' });
  }
});

module.exports = router;
