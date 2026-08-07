const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const projects = db.prepare(`
    SELECT p.*, t.name as team_name FROM projects p JOIN teams t ON t.id = p.team_id
  `).all();
  res.json(projects);
});

router.get('/:id', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Projektia ei löytynyt' });
  res.json(project);
});

router.post('/', (req, res) => {
  const { team_id, name, description } = req.body;
  if (!team_id || !name) return res.status(400).json({ error: 'team_id ja name ovat pakollisia' });
  const result = db.prepare('INSERT INTO projects (team_id, name, description) VALUES (?, ?, ?)')
    .run(team_id, name, description || null);
  res.status(201).json({ id: result.lastInsertRowid, team_id, name, description });
});

module.exports = router;
