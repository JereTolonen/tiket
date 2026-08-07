const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const teams = db.prepare('SELECT * FROM teams').all();
  res.json(teams);
});

router.get('/:id/members', (req, res) => {
  const members = db.prepare(`
    SELECT u.id, u.name, u.email, tm.role
    FROM team_members tm JOIN users u ON u.id = tm.user_id
    WHERE tm.team_id = ?
  `).all(req.params.id);
  res.json(members);
});

router.post('/', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'name on pakollinen' });
  const result = db.prepare('INSERT INTO teams (name, description) VALUES (?, ?)').run(name, description || null);
  res.status(201).json({ id: result.lastInsertRowid, name, description });
});

router.post('/:id/members', (req, res) => {
  const { user_id, role } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id on pakollinen' });
  const result = db.prepare('INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)')
    .run(req.params.id, user_id, role || 'jasen');
  res.status(201).json({ id: result.lastInsertRowid });
});

module.exports = router;
