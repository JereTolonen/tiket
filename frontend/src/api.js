const BASE = 'http://localhost:3001/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Pyyntö epäonnistui (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  getProjects: () => request('/projects'),
  getSprints: (projectId) => request(`/sprints?project_id=${projectId}`),
  getTasks: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/tasks${qs ? `?${qs}` : ''}`);
  },
  getTask: (id) => request(`/tasks/${id}`),
  createTask: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  addComment: (taskId, data) => request(`/tasks/${taskId}/comments`, { method: 'POST', body: JSON.stringify(data) }),
  getUsers: () => request('/users'),
  getTeamMembers: (teamId) => request(`/teams/${teamId}/members`),
};
