import { authService } from '../../services/authService.js';
import { ProjectModal } from '../projectModal.js';

function criarNavbar() {
  const navbar = document.createElement('nav');
  navbar.classList.add('navbar');

  // Pegar informações do usuário do localStorage
  const user = getCurrentUser();
  const userName = user ? user.name || user.email || 'Usuário' : 'Usuário';

  navbar.innerHTML = `
    <div class="navbar-container">
      <div class="navbar-logo">
        <img src="../../assets/images/logo-unigroup.png" alt="Logo Unigroup">
      </div>
      
      <div class="navbar-links">
        <!-- Versão Desktop -->
        <input type="text" placeholder="Pesquisar projeto ou equipe" class="search-input">
        <button class="button-newproject">Criar novo projeto</button>
      </div>
      
      <div class="navbar-usuario">
        <!-- Ícones Mobile (aparecem apenas no mobile) -->
        <div class="mobile-icons">
          <i class="fa-solid fa-magnifying-glass search-icon" title="Pesquisar"></i>
          <i class="fa-solid fa-plus new-project-icon" title="Criar novo projeto"></i>
        </div>
        
        <div class="user-info">
          <span class="user-name">${userName}</span>
          <button class="logout-btn" id="logout-btn">Sair</button>
        </div>
      </div>
    </div>
  `;

  return navbar;
}

function getCurrentUser() {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Erro ao recuperar dados do usuário:', error);
    return null;
  }
}

function handleLogout() {
  try {
    // Limpar dados do localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('token');

    // Limpar qualquer outro dado relacionado ao usuário
    // (adicione aqui outros itens se necessário)

    // Redirecionar para a página de login
    window.location.href = '../../index.html';
  } catch (error) {
    console.error('Erro durante logout:', error);
    // Mesmo com erro, redireciona para segurança
    window.location.href = '../../index.html';
  }
}

function addEventListeners(navbar) {
  // Logo - redirecionar para início
  const logoElement = navbar.querySelector('.navbar-logo img');
  if (logoElement) {
    logoElement.addEventListener('click', () => {
      window.location.href = '../../pages/inicio/inicio.html';
    });
  }

  // Botão de logout
  const logoutBtn = navbar.querySelector('#logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Botão criar projeto (desktop)
  const newProjectButton = navbar.querySelector('.button-newproject');
  if (newProjectButton) {
    newProjectButton.addEventListener('click', () => {
      if (projectModal) {
        projectModal.open();
      }
    });
  }

  // Ícone criar projeto (mobile)
  const newProjectIcon = navbar.querySelector('.new-project-icon');
  if (newProjectIcon) {
    newProjectIcon.addEventListener('click', () => {
      if (projectModal) {
        projectModal.open();
      }
    });
  }

  // Ícone de pesquisa (mobile) - por enquanto só visual
  const searchIcon = navbar.querySelector('.search-icon');
  if (searchIcon) {
    searchIcon.addEventListener('click', () => {
      // TODO: Implementar funcionalidade de pesquisa mobile
      console.log('Pesquisa mobile - a implementar');
    });
  }

  // Input de pesquisa (desktop) - por enquanto só visual
  const searchInput = navbar.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        // TODO: Implementar funcionalidade de pesquisa
        console.log('Pesquisar:', searchInput.value);
      }
    });
  }
}

let projectModal;

document.addEventListener('DOMContentLoaded', () => {
  // Verificar se usuário está logado
  const user = getCurrentUser();
  if (!user && !localStorage.getItem('usuarioLogado')) {
    // Se não estiver logado, redirecionar para login
    window.location.href = '../../index.html';
    return;
  }

  // Criar e inserir navbar
  const header = document.querySelector('header');
  if (header) {
    const navbar = criarNavbar();
    header.appendChild(navbar);

    // Adicionar event listeners
    addEventListeners(navbar);
  }

  // Inicializar modal de projeto
  try {
    projectModal = new ProjectModal();
    projectModal.init();
  } catch (error) {
    console.error('Erro ao inicializar modal de projeto:', error);
  }
});

// Função para atualizar nome do usuário na navbar (pode ser chamada externamente)
export function updateUserName(newName) {
  const userNameElement = document.querySelector('.user-name');
  if (userNameElement) {
    userNameElement.textContent = newName;
  }
}

// Função para forçar logout (pode ser chamada externamente)
export function forceLogout() {
  handleLogout();
}