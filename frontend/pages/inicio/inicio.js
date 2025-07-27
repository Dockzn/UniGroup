import { teamService } from '../../services/teamService.js';
import { authService } from '../../services/authService.js';
import { projectService } from '../../services/projectService.js';

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

async function loadUserProjects() {
    try {
        const projects = await projectService.getUserProjects();
        const projectContainer = document.querySelector('.recentemente-vizualizado .card-equipe');
        
        if (projects && projects.length > 0) {
            projectContainer.innerHTML = '';
            
            projects.forEach(project => {
                const projectCard = document.createElement('div');
                projectCard.className = 'project-card';
                projectCard.innerHTML = `
                    <h3>${project.name}</h3>
                    <p>${project.description || 'Sem descrição'}</p>
                    <p class="project-team">Equipe: ${project.team ? project.team.name : 'Sem equipe'}</p>
                    <button class="view-project-btn" data-project-id="${project.id}">Abrir Quadro</button>
                `;
                projectContainer.appendChild(projectCard);
            });
            
            document.querySelectorAll('.view-project-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const projectId = button.getAttribute('data-project-id');
                    window.location.href = `../quadro/quadro.html?id=${projectId}`;
                });
            });
        } else {
            projectContainer.innerHTML = `
                <div class="empty-state">
                    <p>Você não tem projetos recentes.</p>
                    <button id="create-project-btn">Criar Projeto</button>
                </div>
            `;
            
            document.getElementById('create-project-btn')?.addEventListener('click', () => {
                if (window.projectModal) {
                    window.projectModal.open();
                } else {
                    alert('O modal de criação de projetos não está disponível.');
                }
            });
        }
    } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        const projectContainer = document.querySelector('.recentemente-vizualizado .card-equipe');
        projectContainer.innerHTML = '<p class="error-message">Erro ao carregar projetos. Tente novamente mais tarde.</p>';
    }
}

// Carrega os dados quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Exibe mensagem de boas-vindas
    showWelcomeMessage();
    
    // Carrega as equipes do usuário
    loadUserTeams();
    
    // Carrega os projetos do usuário
    loadUserProjects();
});