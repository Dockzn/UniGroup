import { authService } from '../../services/authService.js';
import { ProjectModal } from '../projectModal.js';

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

let projectModal;

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
  
  // Inicializar modal de projeto
  projectModal = new ProjectModal();
  projectModal.init();
  
  // Adicionar evento ao botão de criar novo projeto
  const newProjectButton = navbar.querySelector('.button-newproject');
  if (newProjectButton) {
    newProjectButton.addEventListener('click', () => {
      projectModal.open();
    });
  }
});