import { useState } from 'react';
import { api } from './api';

export default function NewTaskForm({ project, sprints, users, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [sprintId, setSprintId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [reporterId, setReporterId] = useState(users[0]?.id || '');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Otsikko on pakollinen'); return; }
    try {
      await api.createTask({
        project_id: project.id,
        sprint_id: sprintId || null,
        title,
        description,
        priority,
        assignee_id: assigneeId || null,
        reporter_id: reporterId,
        due_date: dueDate || null,
      });
      onCreated();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 style={{ margin: 0, fontSize: 18 }}>Uusi tiketti</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={submit}>
          {error && <div className="error-banner" style={{ margin: '10px 0' }}>{error}</div>}

          <div className="field" style={{ marginTop: 12 }}>
            <label>Otsikko</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>

          <div className="field" style={{ marginTop: 10 }}>
            <label>Kuvaus</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Sprintti</label>
              <select value={sprintId} onChange={(e) => setSprintId(e.target.value)}>
                <option value="">— Backlog (ei sprinttiä) —</option>
                {sprints.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Prioriteetti</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
                <option value="urgent">urgent</option>
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Vastuuhenkilö</label>
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                <option value="">— ei osoitettu —</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Raportoija</label>
              <select value={reporterId} onChange={(e) => setReporterId(e.target.value)}>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>

          <div className="field" style={{ marginTop: 10 }}>
            <label>Määräaika</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <div style={{ marginTop: 18, textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Peruuta</button>
            <button type="submit" className="btn-primary">Luo tiketti</button>
          </div>
        </form>
      </div>
    </div>
  );
}
