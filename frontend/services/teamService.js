// Funções de API
import { authService } from './authService.js';

// Para alternar entre ambiente local e remoto, mude a constante IS_LOCAL
const IS_LOCAL = false; // Definido como false para usar o servidor remoto
const API_URL = IS_LOCAL ? 'http://localhost:3000' : 'https://unigroup.onrender.com';

async function removeMember(teamId, userId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/teams/${teamId}/members/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao remover membro:', error);
        throw error;
    }
}

async function leaveTeam(teamId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/teams/${teamId}/leave`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao sair da equipe:', error);
        throw error;
    }
}

async function getTeamMembers(teamId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/teams/${teamId}/members`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao listar membros:', error);
        throw error;
    }
}

async function getTeamDetails(teamId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/teams/${teamId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao obter detalhes da equipe:', error);
        throw error;
    }
}

async function createTeam(name, description) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/teams`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, description })
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao criar equipe:', error);
        throw error;
    }
}

async function listTeams() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/teams`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao listar equipes:', error);
        throw error;
    }
}

async function addMemberByEmail(teamId, email) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/teams/${teamId}/members/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email })
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao adicionar membro:', error);
        throw error;
    }
}

async function joinTeam(inviteCode) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/teams/join/${inviteCode}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao entrar na equipe:', error);
        throw error;
    }
}

// Exporta as funções
export const teamService = {
    createTeam,
    listTeams,
    joinTeam,
    removeMember,
    leaveTeam,
    getTeamMembers,
    getTeamDetails,
    addMemberByEmail
};
