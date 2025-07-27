// Funções de API
const API_URL = 'https://unigroup.onrender.com';

async function createProject(teamId, name, description, dueDate) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ teamId, name, description, dueDate })
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao criar projeto:', error);
        throw error;
    }
}

async function listProjects(teamId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/projects/team/${teamId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao listar projetos:', error);
        throw error;
    }
}

async function toggleFavorite(projectId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/projects/${projectId}/favorite`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao favoritar/desfavoritar projeto:', error);
        throw error;
    }
}

async function toggleArchive(projectId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/projects/${projectId}/archive`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao arquivar/ativar projeto:', error);
        throw error;
    }
}

// Exporta as funções
export const projectService = {
    createProject,
    listProjects,
    toggleFavorite,
    toggleArchive
};
