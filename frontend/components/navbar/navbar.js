import { authService } from '../../services/authService.js';
import { checkAuth } from '../../services/authGuard.js';

// Verificar autenticação antes de renderizar a navbar
if (!checkAuth() && !isPublicPage(window.location.pathname)) {
  console.error('Acesso não autorizado detectado na navbar');
  window.location.href = '/pages/login/login.html';
}

// Helper para identificar páginas públicas
function isPublicPage(path) {
  const publicPages = ['/login/login.html', '/cadastro/cadastro.html', '/index.html', '/'];
  return publicPages.some(publicPath => path.includes(publicPath));
}

function criarNavbar() {
  const navbar = document.createElement('nav');
  navbar.classList.add('navbar');

  navbar.innerHTML = `
    <div class="navbar-container">
      <div class="navbar-logo">
        <img src="../../assets/images/logo-unigroup.png" alt="Logo Unigroup" style="cursor: pointer;">
      </div>
      <div class="navbar-links">
        <input type="text" placeholder="Pesquisar projeto ou equipe" class="search-input">
        <button class="button-newproject">Criar novo projeto</button>
      </div>
      <div class="navbar-usuario">
        <button class="button-user"><i class="fa-solid fa-circle-user"></i></button>
      </div>
    </div>
  `;

  return navbar;
}

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  const navbar = criarNavbar();
  header.appendChild(navbar);
  
  const logoElement = navbar.querySelector('.navbar-logo img');
  if (logoElement) {
    logoElement.addEventListener('click', () => {
      window.location.href = '../../pages/inicio/inicio.html';
    });
  }
});
