// Funções de API
import { authService } from './authService.js';

const IS_LOCAL = false;
const API_URL = IS_LOCAL ? 'http://localhost:3000' : 'https://unigroup.onrender.com';

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

async function getUserProjects() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/projects/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao obter projetos do usuário:', error);
        throw error;
    }
}

export const projectService = {
    createProject,
    listProjects,
    toggleFavorite,
    toggleArchive,
    getUserProjects
};
