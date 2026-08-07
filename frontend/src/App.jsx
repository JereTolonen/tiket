import { useEffect, useState, useCallback } from 'react';
import { api } from './api';
import TaskModal from './TaskModal';
import NewTaskForm from './NewTaskForm';
import './App.css';

const COLUMNS = [
  { key: 'backlog', label: 'Backlog' },
  { key: 'todo', label: 'Tehtävä' },
  { key: 'in_progress', label: 'Työn alla' },
  { key: 'review', label: 'Katselmoinnissa' },
  { key: 'done', label: 'Valmis' },
];

function initials(name) {
  if (!name) return '—';
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

export default function App() {
  const [project, setProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [activeSprint, setActiveSprint] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      setError(null);
      const projects = await api.getProjects();
      const p = projects[0];
      setProject(p);
      if (p) {
        const [sprintList, taskList, userList] = await Promise.all([
          api.getSprints(p.id),
          api.getTasks({ project_id: p.id }),
          api.getUsers(),
        ]);
        setSprints(sprintList);
        setTasks(taskList);
        setUsers(userList);
      }
    } catch (e) {
      setError(e.message + ' — varmista että backend on käynnissä (localhost:3001)');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const visibleTasks = activeSprint === 'all'
    ? tasks
    : tasks.filter((t) => String(t.sprint_id) === String(activeSprint));

  const moveTask = async (taskId, newStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    try {
      await api.updateTask(taskId, { status: newStatus });
    } catch (e) {
      setError(e.message);
      loadAll();
    }
  };

  const handleTaskCreated = () => {
    setShowNewForm(false);
    loadAll();
  };

  if (loading) return <div className="loading">Ladataan tikettejä…</div>;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">ASKEL</span>
          <span className="brand-sub">tikettitaulu — {project ? project.name : 'ei projektia'}</span>
        </div>
        <div className="topbar-meta">
          {tasks.length} tikettiä · {sprints.length} sprinttiä<br />
          React + Node/Express + SQLite
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <nav className="sprint-bar">
        <button
          className={`sprint-tab ${activeSprint === 'all' ? 'active' : ''}`}
          onClick={() => setActiveSprint('all')}
        >
          Kaikki
        </button>
        {sprints.map((s) => (
          <button
            key={s.id}
            className={`sprint-tab ${String(activeSprint) === String(s.id) ? 'active' : ''}`}
            onClick={() => setActiveSprint(s.id)}
          >
            <span className={`sprint-status ${s.status}`} />
            {s.name}
          </button>
        ))}
      </nav>

      <div className="toolbar">
        <span className="mono" style={{ fontSize: 12, color: 'var(--slate)' }}>
          {activeSprint === 'all' ? 'Näytetään kaikki sprintit' : sprints.find((s) => String(s.id) === String(activeSprint))?.name}
        </span>
        <button className="new-ticket-btn" onClick={() => setShowNewForm(true)}>+ Uusi tiketti</button>
      </div>

      <div className="board">
        {COLUMNS.map((col) => {
          const colTasks = visibleTasks.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              className="column"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const id = Number(e.dataTransfer.getData('text/task-id'));
                if (id) moveTask(id, col.key);
              }}
            >
              <div className="column-head">
                <span>{col.label}</span>
                <span className="column-count">{colTasks.length}</span>
              </div>
              <div className="column-body">
                {colTasks.length === 0 && <div className="empty-col">— tyhjä —</div>}
                {colTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`card ${t.priority}`}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/task-id', t.id)}
                    onClick={() => setSelectedTaskId(t.id)}
                  >
                    <div className="card-id">#T-{t.id}</div>
                    <div className="card-title">{t.title}</div>
                    <div className="card-footer">
                      <span>{t.due_date || 'ei määräaikaa'}</span>
                      <span className="avatar" title={t.assignee_name || 'Ei osoitettu'}>
                        {t.assignee_name ? initials(t.assignee_name) : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedTaskId && (
        <TaskModal
          taskId={selectedTaskId}
          users={users}
          onClose={() => setSelectedTaskId(null)}
          onChanged={loadAll}
        />
      )}

      {showNewForm && (
        <NewTaskForm
          project={project}
          sprints={sprints}
          users={users}
          onClose={() => setShowNewForm(false)}
          onCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}
