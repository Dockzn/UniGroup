import { teamService } from '../../services/teamService.js';
import { authService } from '../../services/authService.js';
import { projectService } from '../../services/projectService.js';

const currentUser = authService.getCurrentUser();

async function loadUserTeams() {
    try {
        const user = localStorage.getItem('user');
        let userTeamId = null;
        let userTeamName = '';
        if (user) {
            try {
                const userObj = JSON.parse(user);
                userTeamId = userObj.team_id;
                userTeamName = userObj.team_name || '';
            } catch (e) {}
        }
        const teamContainer = document.querySelector('.equipes .card-equipe');
        if (userTeamId) {
            const res = await fetch(`../../../../backend/src/routes/teamRoutes.js/${userTeamId}`);
            let team = null;
            try {
                team = await res.json();
            } catch (e) {}
            teamContainer.innerHTML = '';
            if (team && team.name) {
                const teamCard = document.createElement('div');
                teamCard.className = 'team-card';
                teamCard.style.backgroundImage = "url('../../assets/images/imagem-projeto.png')";
                teamCard.style.backgroundSize = 'cover';
                teamCard.style.backgroundPosition = 'center';
                teamCard.style.borderRadius = '12px';
                teamCard.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                teamCard.style.margin = '16px 0';
                teamCard.style.padding = '16px';
                teamCard.style.color = '#222';
                teamCard.innerHTML = `
                    <div style="background:rgba(255,255,255,0.85);padding:18px 12px 12px 12px;border-radius:8px;display:flex;flex-direction:column;align-items:flex-start;">
                        <h3 style="margin:0 0 8px 0;font-size:1.3em;">${team.name}</h3>
                        <p style="margin:0 0 0 0;">${team.description || 'Sem descrição'}</p>
                    </div>
                `;
                teamContainer.appendChild(teamCard);
            }
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
        const user = localStorage.getItem('user');
        let userId = null;
        if (user) {
            try {
                const userObj = JSON.parse(user);
                userId = userObj.id;
            } catch (e) {}
        }
        const projects = await projectService.getUserProjects(userId);
        const projectContainer = document.querySelector('.recentemente-vizualizado .card-equipe');
        if (projects && projects.length > 0) {
            projectContainer.innerHTML = '';
            projects.forEach(project => {
                const projectCard = document.createElement('div');
                projectCard.className = 'project-card';
                projectCard.style.backgroundImage = "url('../../assets/images/fundo de equipe_e_trabalho.jpg')";
                projectCard.style.backgroundSize = 'cover';
                projectCard.style.backgroundPosition = 'center';
                projectCard.style.borderRadius = '12px';
                projectCard.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                projectCard.style.margin = '16px 0';
                projectCard.style.padding = '16px';
                projectCard.style.color = '#222';
                projectCard.innerHTML = `
                    <div style="background:rgba(255,255,255,0.85);padding:12px;border-radius:8px;">
                        <h3 style="margin:0 0 8px 0;">${project.name}</h3>
                        <p class="project-team" style="margin:0 0 12px 0;">Equipe: ${project.team ? project.team.name : 'Sem equipe'}</p>
                        <button class="view-project-btn" data-project-id="${project.id}" style="padding:6px 16px;border-radius:6px;border:none;background:#28a745;color:#fff;cursor:pointer;">Abrir Quadro</button>
                    </div>
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
                </div>
            `;
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