const express = require('express');
const db = require('../db');
const router = express.Router();

// Listaa tehtävät, suodattimet: project_id, sprint_id, status, assignee_id
router.get('/', (req, res) => {
  const { project_id, sprint_id, status, assignee_id } = req.query;
  let query = `
    SELECT t.*, a.name as assignee_name, r.name as reporter_name
    FROM tasks t
    LEFT JOIN users a ON a.id = t.assignee_id
    LEFT JOIN users r ON r.id = t.reporter_id
    WHERE 1=1
  `;
  const params = [];
  if (project_id) { query += ' AND t.project_id = ?'; params.push(project_id); }
  if (sprint_id) { query += ' AND t.sprint_id = ?'; params.push(sprint_id); }
  if (status) { query += ' AND t.status = ?'; params.push(status); }
  if (assignee_id) { query += ' AND t.assignee_id = ?'; params.push(assignee_id); }
  query += ' ORDER BY t.created_at DESC';

  const tasks = db.prepare(query).all(...params);
  res.json(tasks);
});

// Yksittäinen tehtävä + kommentit + liitteet (tiketin "detail view")
router.get('/:id', (req, res) => {
  const task = db.prepare(`
    SELECT t.*, a.name as assignee_name, r.name as reporter_name
    FROM tasks t
    LEFT JOIN users a ON a.id = t.assignee_id
    LEFT JOIN users r ON r.id = t.reporter_id
    WHERE t.id = ?
  `).get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Tehtävää ei löytynyt' });

  const comments = db.prepare(`
    SELECT c.*, u.name as user_name FROM comments c
    JOIN users u ON u.id = c.user_id WHERE c.task_id = ? ORDER BY c.created_at
  `).all(req.params.id);

  const attachments = db.prepare('SELECT * FROM attachments WHERE task_id = ?').all(req.params.id);

  res.json({ ...task, comments, attachments });
});

// Uusi tehtävä/tiketti
router.post('/', (req, res) => {
  const { project_id, sprint_id, title, description, priority, assignee_id, reporter_id, due_date } = req.body;
  if (!project_id || !title || !reporter_id) {
    return res.status(400).json({ error: 'project_id, title ja reporter_id ovat pakollisia' });
  }
  const result = db.prepare(`
    INSERT INTO tasks (project_id, sprint_id, title, description, priority, assignee_id, reporter_id, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(project_id, sprint_id || null, title, description || null, priority || 'medium',
         assignee_id || null, reporter_id, due_date || null);
  res.status(201).json({ id: result.lastInsertRowid });
});

// Päivitä tehtävä (esim. tilan vaihto tikettitaululla, uudelleenosoitus)
router.patch('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Tehtävää ei löytynyt' });

  const fields = ['title', 'description', 'status', 'priority', 'assignee_id', 'sprint_id', 'due_date'];
  const updates = [];
  const params = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      params.push(req.body[f]);
    }
  }
  if (updates.length === 0) return res.status(400).json({ error: 'Ei päivitettäviä kenttiä' });

  updates.push(`updated_at = datetime('now')`);
  params.push(req.params.id);
  db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  res.json({ ok: true });
});

// Poista tehtävä
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// Kommentin lisäys tehtävään
router.post('/:id/comments', (req, res) => {
  const { user_id, content } = req.body;
  if (!user_id || !content) return res.status(400).json({ error: 'user_id ja content ovat pakollisia' });
  const result = db.prepare('INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)')
    .run(req.params.id, user_id, content);
  res.status(201).json({ id: result.lastInsertRowid });
});

module.exports = router;
