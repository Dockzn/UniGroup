import { authService } from '../../services/authService.js';
import { projectService } from '../../services/projectService.js';

const currentUser = authService.getCurrentUser();

// --- Funções para gerenciar favoritos ---
function getFavoriteProjects() {
    const favorites = localStorage.getItem(`favorites_${currentUser.id}`);
    return favorites ? JSON.parse(favorites) : [];
}

function toggleFavorite(projectId) {
    let favorites = getFavoriteProjects();
    const projectIdNum = Number(projectId);
    const index = favorites.indexOf(projectIdNum);

    if (index > -1) {
        favorites.splice(index, 1); // Remove dos favoritos
    } else {
        favorites.push(projectIdNum); // Adiciona aos favoritos
    }

    localStorage.setItem(`favorites_${currentUser.id}`, JSON.stringify(favorites));
    loadUserProjects(); // Recarrega os projetos para atualizar a UI
}

// --- Funções de Carregamento da UI ---
function showWelcomeMessage() {
    const welcomeContainer = document.createElement('div');
    welcomeContainer.className = 'welcome-message';
    welcomeContainer.innerHTML = `
<h2>Bem-vindo, ${currentUser ? currentUser.name : 'Usuário'}!</h2>
<p>Este é seu painel de gerenciamento de projetos e equipes.</p>
`;
    const column2 = document.querySelector('.colum2');
    column2.insertBefore(welcomeContainer, column2.firstChild);
}

function renderProjects(container, projects, areFavorites) {
    if (projects.length === 0) {
        if (areFavorites) {
            container.innerHTML = '<p>Nenhum projeto favoritado ainda.</p>';
        } else {
            container.innerHTML = `
<div class="empty-state">
<p>Você ainda não tem projetos.</p>
</div>
`;
        }
        return;
    }

    container.innerHTML = ''; // Limpa o container
    projects.forEach(project => {
        const isFav = getFavoriteProjects().includes(project.id);
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.setAttribute('data-project-name', project.name.toLowerCase());

        projectCard.innerHTML = `
<img src="../../assets/images/equipe-trabalho.jpg" alt="Imagem do Projeto" />
<div>
  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
    <h3>${project.name}</h3>
    <button class="favorite-btn" data-project-id="${project.id}"
      style="background: none; border: none; font-size: 18px; cursor: pointer; color: ${isFav ? '#ffd700' : '#ccc'};">
      <i class="fas fa-star"></i>
    </button>
  </div>
  <button class="view-project-btn" data-project-id="${project.id}">Abrir Quadro</button>
</div>
`;

        container.appendChild(projectCard);
    });
}


async function loadUserProjects() {
    const projectContainer = document.querySelector('.recentemente-vizualizado .card-equipe');
    const favoritosSection = document.getElementById('favoritosSection');
    const favoritosContainer = document.getElementById('favoritosContainer');

    try {
        const projects = await projectService.getUserProjects(currentUser.id);
        const favoriteProjectIds = getFavoriteProjects();

        const favoriteProjects = projects.filter(p => favoriteProjectIds.includes(p.id));
        const otherProjects = projects.filter(p => !favoriteProjectIds.includes(p.id));

        if (favoriteProjects.length > 0) {
            favoritosSection.style.display = 'block';
            renderProjects(favoritosContainer, favoriteProjects, true);
        } else {
            favoritosSection.style.display = 'none';
        }

        renderProjects(projectContainer, otherProjects, false);

        // Adicionar Listeners após renderizar
        addProjectCardListeners();

    } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        projectContainer.innerHTML = '<p class="error-message">Erro ao carregar projetos. Tente novamente mais tarde.</p>';
    }
}

function addProjectCardListeners() {
    document.querySelectorAll('.view-project-btn').forEach(button => {
        button.addEventListener('click', () => {
            const projectId = button.getAttribute('data-project-id');
            window.location.href = `../quadro/quadro.html?projectId=${projectId}`;
        });
    });

    document.querySelectorAll('.favorite-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const projectId = button.getAttribute('data-project-id');
            toggleFavorite(projectId);
        });
    });
}

function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.project-card').forEach(card => {
            const projectName = card.getAttribute('data-project-name');
            if (projectName.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}


// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) {
        window.location.href = '../login/login.html';
        return;
    }
    showWelcomeMessage();
    loadUserProjects();
    setupSearch();
});