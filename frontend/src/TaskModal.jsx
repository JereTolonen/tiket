import { useEffect, useState } from 'react';
import { api } from './api';

const STATUSES = [
  { key: 'backlog', label: 'Backlog' },
  { key: 'todo', label: 'Tehtävä' },
  { key: 'in_progress', label: 'Työn alla' },
  { key: 'review', label: 'Katselmoinnissa' },
  { key: 'done', label: 'Valmis' },
];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function TaskModal({ taskId, users, onClose, onChanged }) {
  const [task, setTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentUser, setCommentUser] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const data = await api.getTask(taskId);
    setTask(data);
    if (!commentUser && users.length) setCommentUser(users[0].id);
  };

  useEffect(() => { load(); }, [taskId]);

  if (!task) return null;

  const update = async (fields) => {
    setBusy(true);
    await api.updateTask(taskId, fields);
    await load();
    onChanged();
    setBusy(false);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await api.addComment(taskId, { user_id: commentUser, content: commentText });
    setCommentText('');
    load();
  };

  const remove = async () => {
    if (!confirm('Poistetaanko tiketti pysyvästi?')) return;
    await api.deleteTask(taskId);
    onChanged();
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="card-id">#T-{task.id}</div>
            <h2 style={{ margin: '4px 0 0', fontSize: 19 }}>{task.title}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <textarea
          defaultValue={task.description || ''}
          onBlur={(e) => update({ description: e.target.value })}
          placeholder="Kuvaus…"
          style={{ width: '100%', marginTop: 12 }}
        />

        <div className="field-row">
          <div className="field">
            <label>Tila</label>
            <select value={task.status} disabled={busy} onChange={(e) => update({ status: e.target.value })}>
              {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Prioriteetti</label>
            <select value={task.priority} disabled={busy} onChange={(e) => update({ priority: e.target.value })}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Vastuuhenkilö</label>
            <select
              value={task.assignee_id || ''}
              disabled={busy}
              onChange={(e) => update({ assignee_id: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">— ei osoitettu —</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Määräaika</label>
            <input
              type="date"
              defaultValue={task.due_date || ''}
              onBlur={(e) => update({ due_date: e.target.value || null })}
            />
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 6 }} className="mono">
          Raportoija: {task.reporter_name} · Luotu {task.created_at} · Muokattu {task.updated_at}
        </div>

        <div className="comments">
          <strong style={{ fontSize: 13 }}>Kommentit ({task.comments.length})</strong>
          {task.comments.map((c) => (
            <div className="comment" key={c.id}>
              <div className="comment-meta">{c.user_name} · {c.created_at}</div>
              {c.content}
            </div>
          ))}
          <form className="comment-form" onSubmit={submitComment}>
            <select value={commentUser} onChange={(e) => setCommentUser(e.target.value)} style={{ width: 140 }}>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <input
              placeholder="Kirjoita kommentti…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button className="btn-primary" type="submit">Lähetä</button>
          </form>
        </div>

        <div style={{ marginTop: 18, textAlign: 'right' }}>
          <button className="btn-secondary" onClick={remove}>Poista tiketti</button>
        </div>
      </div>
    </div>
  );
}
