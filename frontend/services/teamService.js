const IS_LOCAL = false;
const API_URL = IS_LOCAL ? 'http://localhost:3000' : 'https://unigroup.onrender.com';

class TeamService {
    #getToken() {
        return localStorage.getItem('token');
    }
    
    async #fetchAPI(endpoint, options = {}) {
        try {
            const token = this.#getToken();
            const defaultHeaders = {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            };
            
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers
                }
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Erro na requisição para ${endpoint}:`, error);
            throw error;
        }
    }
    
    async getUserTeam() {
        return this.#fetchAPI('/api/teams');
    }
    
    async createTeam(name, description) {
        return this.#fetchAPI('/api/teams', {
            method: 'POST',
            body: JSON.stringify({ name, description })
        });
    }
    
    async getTeamMembers(teamId) {
        return this.#fetchAPI(`/api/teams/${teamId}/members`);
    }
    
    async addMemberByEmail(teamId, email) {
        return this.#fetchAPI(`/api/teams/${teamId}/members/add`, {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }
    
    async removeMember(teamId, userId) {
        return this.#fetchAPI(`/api/teams/${teamId}/members/${userId}`, {
            method: 'DELETE'
        });
    }
    
    async leaveTeam(teamId) {
        return this.#fetchAPI(`/api/teams/${teamId}/leave`, {
            method: 'POST'
        });
    }
    
    async getTeamDetails(teamId) {
        return this.#fetchAPI(`/api/teams/${teamId}`);
    }
    
    async joinTeam(inviteCode) {
        return this.#fetchAPI(`/api/teams/join/${inviteCode}`, {
            method: 'GET'
        });
    }
}

// Exporta uma instância única do serviço
export const teamService = new TeamService();
