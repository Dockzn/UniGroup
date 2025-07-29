const IS_LOCAL = false;
const API_URL = IS_LOCAL ? 'http://localhost:3000' : 'https://unigroup.onrender.com';

export const boardService = {
  async getListsByProject(projectId) {
    try {
      const response = await fetch(`${API_URL}/api/projects/${projectId}/lists`);
      if (!response.ok) {
        throw new Error('Erro ao buscar listas');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar listas:', error);
      return [];
    }
  },

  async getActivitiesByList(listId) {
    try {
      const response = await fetch(`${API_URL}/api/lists/${listId}/activities`);
      if (!response.ok) {
        throw new Error('Erro ao buscar atividades');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      return [];
    }
  },

  async createList(projectId, name) {
    try {
      // CORREÇÃO: Usar a rota correta que existe no backend
      const response = await fetch(`${API_URL}/api/projects/${projectId}/lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar lista');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar lista:', error);
      throw error;
    }
  },

  async updateList(listId, data) {
    try {
      const response = await fetch(`${API_URL}/api/lists/${listId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar lista');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar lista:', error);
      throw error;
    }
  },

  async deleteList(listId) {
    try {
      const response = await fetch(`${API_URL}/api/lists/${listId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar lista');
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar lista:', error);
      throw error;
    }
  },

  async createActivity(listId, activityData) {
    try {
      // CORREÇÃO: Usar a rota correta que existe no backend
      const response = await fetch(`${API_URL}/api/lists/${listId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activityData)
      });

      if (!response.ok) {
        throw new Error('Erro ao criar atividade');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      throw error;
    }
  },

  async updateActivity(activityId, data) {
    try {
      const response = await fetch(`${API_URL}/api/activities/${activityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar atividade');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      throw error;
    }
  },

  async deleteActivity(activityId) {
    try {
      const response = await fetch(`${API_URL}/api/activities/${activityId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar atividade');
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar atividade:', error);
      throw error;
    }
  }
};