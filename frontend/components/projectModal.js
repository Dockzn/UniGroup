import { teamService } from '../services/teamService.js';
import { projectService } from '../services/projectService.js';

export class ProjectModal {
  constructor() {
    this.modal = null;
    this.teams = [];
  }

  async init() {
    await this.createModalStructure();
    try {
      // Carregar as equipes do usuário
      this.teams = await teamService.listTeams();
      this.populateTeamSelect();
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
    }
  }

  async createModalStructure() {
    if (!document.getElementById('project-modal')) {
      let teamName = '';
      let teamId = '';
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userObj = JSON.parse(user);
          if (userObj.team_id) {
            teamId = userObj.team_id;
            const IS_LOCAL = false; 
            const API_URL = IS_LOCAL ? 'http://localhost:3000' : 'https://unigroup.onrender.com';
            try {
              const res = await fetch(`${API_URL}/api/teams/${teamId}`);
              if (res.ok) {
                const team = await res.json();
                teamName = team.name;
              }
            } catch (e) {}
          }
        } catch (e) {}
      }
      const modalHTML = `
        <div id="project-modal" class="modal">
          <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Criar um novo projeto</h2>
            <form id="create-project-form">
              <div class="form-group">
                <label for="project-name">Nome do projeto</label>
                <input type="text" id="project-name" name="name" required>
              </div>
              <div class="form-group">
                <label for="project-team-static">Nome da equipe</label>
                <input type="text" id="project-team-static" value="${teamName}" disabled style="background:#f5f5f5;">
                <input type="hidden" id="project-team-id" name="teamId" value="${teamId}">
              </div>
              <div class="form-actions">
                <button type="button" id="cancel-project">Cancelar</button>
                <button type="submit">Criar</button>
              </div>
            </form>
          </div>
        </div>
      `;

      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = modalHTML;
      document.body.appendChild(modalContainer.firstElementChild);
      
      this.modal = document.getElementById('project-modal');
      this.attachEvents();
    } else {
      this.modal = document.getElementById('project-modal');
      this.attachEvents();
    }
  }

  attachEvents() {
    const closeBtn = this.modal.querySelector('.close');
    closeBtn.onclick = () => this.removeModal();

    window.addEventListener('mousedown', this._outsideClickHandler);

    const cancelBtn = this.modal.querySelector('#cancel-project');
    cancelBtn.onclick = () => this.removeModal();

    const form = this.modal.querySelector('#create-project-form');
    form.onsubmit = (e) => this.handleSubmit(e);
  }

  _outsideClickHandler = (event) => {
    if (this.modal && event.target === this.modal) {
      this.removeModal();
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    try {
      const user = localStorage.getItem('user');
      let userId = null;
      if (user) {
        try {
          const userObj = JSON.parse(user);
          userId = userObj.id;
        } catch (e) {}
      }
      const projectData = {
        name: formData.get('name'),
        teamId: formData.get('teamId'),
        userId: userId
      };
      if (!projectData.name || !projectData.teamId || !projectData.userId) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
      }
      const response = await projectService.createProject(projectData);

      if (response && response.project && response.project.id) {
        alert('Projeto criado com sucesso!');
        this.close();
        window.location.href = `../quadro/quadro.html?projectId=${response.project.id}`;
      } else {
        alert('Projeto criado, mas não foi possível redirecionar.');
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      alert('Erro ao criar projeto. Tente novamente.');
    }
  }

  open() {
    if (this.modal) {
      this.modal.style.display = 'block';
    }
  }

  close() {
    this.removeModal();
  }

  removeModal() {
    if (this.modal) {
      window.removeEventListener('mousedown', this._outsideClickHandler);
      this.modal.parentNode.removeChild(this.modal);
      this.modal = null;
    }
  }
}

// Expor a classe globalmente para que possa ser acessada por outros scripts
window.ProjectModal = ProjectModal;
