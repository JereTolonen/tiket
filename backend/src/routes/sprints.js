const express = require('express');
const db = require('../db');
const router = express.Router();

// Listaa sprintit (voi suodattaa projektin mukaan: /sprints?project_id=1)
router.get('/', (req, res) => {
  const { project_id } = req.query;
  const sprints = project_id
    ? db.prepare('SELECT * FROM sprints WHERE project_id = ? ORDER BY start_date').all(project_id)
    : db.prepare('SELECT * FROM sprints ORDER BY start_date').all();
  res.json(sprints);
});

// Sprintin sisältämät tehtävät (burndown/board-näkymää varten)
router.get('/:id/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks WHERE sprint_id = ?').all(req.params.id);
  res.json(tasks);
});

router.post('/', (req, res) => {
  const { project_id, name, start_date, end_date, status } = req.body;
  if (!project_id || !name || !start_date || !end_date) {
    return res.status(400).json({ error: 'project_id, name, start_date ja end_date ovat pakollisia' });
  }
  const result = db.prepare(`
    INSERT INTO sprints (project_id, name, start_date, end_date, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(project_id, name, start_date, end_date, status || 'suunniteltu');
  res.status(201).json({ id: result.lastInsertRowid });
});

router.patch('/:id', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE sprints SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ ok: true });
});

module.exports = router;
