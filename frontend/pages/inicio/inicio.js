import { checkAuth } from '../../services/authGuard.js';
import { teamService } from '../../services/teamService.js';
import { authService } from '../../services/authService.js';

if (!checkAuth()) {
    throw new Error('Unauthorized');
}

// Obtém dados do usuário logado
const currentUser = authService.getCurrentUser();

async function loadUserTeams() {
    try {
        const teams = await teamService.listTeams();
        const teamContainer = document.querySelector('.equipes .card-equipe');
        
        if (teams && teams.length > 0) {
            teamContainer.innerHTML = '';
            
            teams.forEach(team => {
                const teamCard = document.createElement('div');
                teamCard.className = 'team-card';
                teamCard.innerHTML = `
                    <h3>${team.name}</h3>
                    <p>${team.description || 'Sem descrição'}</p>
                    <button class="view-team-btn" data-team-id="${team.id}">Ver Equipe</button>
                `;
                teamContainer.appendChild(teamCard);
            });
            
            // Adicionar event listeners para os botões de visualização
            document.querySelectorAll('.view-team-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const teamId = button.getAttribute('data-team-id');
                    window.location.href = `../equipes/equipes.html?id=${teamId}`;
                });
            });
        } else {
            teamContainer.innerHTML = `
                <div class="empty-state">
                    <p>Você não pertence a nenhuma equipe ainda.</p>
                    <button id="create-team-btn">Criar Equipe</button>
                </div>
            `;
            
            document.getElementById('create-team-btn')?.addEventListener('click', () => {
                window.location.href = '../equipes/equipes.html';
            });
        }
    } catch (error) {
        console.error('Erro ao carregar equipes:', error);
        const teamContainer = document.querySelector('.equipes .card-equipe');
        teamContainer.innerHTML = '<p class="error-message">Erro ao carregar equipes. Tente novamente mais tarde.</p>';
    }
}

// Função para mostrar boas-vindas ao usuário
function showWelcomeMessage() {
    const welcomeContainer = document.createElement('div');
    welcomeContainer.className = 'welcome-message';
    welcomeContainer.innerHTML = `
        <h2>Bem-vindo, ${currentUser ? currentUser.name : 'Usuário'}!</h2>
        <p>Este é seu painel de gerenciamento de projetos e equipes.</p>
    `;
    
    // Inserir a mensagem no início da segunda coluna
    const column2 = document.querySelector('.colum2');
    column2.insertBefore(welcomeContainer, column2.firstChild);
}

// Carrega os dados quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Exibe mensagem de boas-vindas
    showWelcomeMessage();
    
    // Carrega as equipes do usuário
    loadUserTeams();
});