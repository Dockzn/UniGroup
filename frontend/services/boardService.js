const IS_LOCAL = false;
const API_URL = IS_LOCAL ? 'http://localhost:3000' : 'https://unigroup.onrender.com';

export const boardService = {
  async getListsByProject(projectId) {
    const res = await fetch(`${API_URL}/api/projects/${projectId}/lists`);
    return res.json();
  },
  async createList(projectId, name) {
    const res = await fetch(`${API_URL}/api/projects/${projectId}/lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    return res.json();
  },
  async deleteList(listId) {
    const res = await fetch(`${API_URL}/api/lists/${listId}`, {
      method: 'DELETE'
    });
    return res.json();
  },
  async getActivitiesByList(listId) {
    const res = await fetch(`${API_URL}/api/lists/${listId}/activities`);
    return res.json();
  },
  async createActivity(listId, activity) {
    const res = await fetch(`${API_URL}/api/lists/${listId}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity)
    });
    return res.json();
  },
  async updateActivity(activityId, data) {
    const res = await fetch(`${API_URL}/api/activities/${activityId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteActivity(activityId) {
    const res = await fetch(`${API_URL}/api/activities/${activityId}`, {
      method: 'DELETE'
    });
    return res.json();
  }
};
