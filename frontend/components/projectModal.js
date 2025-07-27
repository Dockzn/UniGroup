import { teamService } from '../services/teamService.js';
import { projectService } from '../services/projectService.js';

export class ProjectModal {
  constructor() {
    this.modal = null;
    this.teams = [];
  }

  async init() {
    // Criar a estrutura do modal
    this.createModalStructure();
    
    try {
      // Carregar as equipes do usuário
      this.teams = await teamService.listTeams();
      this.populateTeamSelect();
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
    }

    // Adicionar eventos
    this.attachEvents();
  }

  createModalStructure() {
    // Criar o elemento do modal se não existir
    if (!document.getElementById('project-modal')) {
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
                <label for="project-team">Nome da equipe</label>
                <select id="project-team" name="teamId" required>
                  <option value="">Selecione uma equipe</option>
                </select>
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
    } else {
      this.modal = document.getElementById('project-modal');
    }
  }

  populateTeamSelect() {
    const teamSelect = this.modal.querySelector('#project-team');
    teamSelect.innerHTML = '<option value="">Selecione uma equipe</option>';
    
    if (this.teams && this.teams.length > 0) {
      this.teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = team.name;
        teamSelect.appendChild(option);
      });
    } else {
      const option = document.createElement('option');
      option.disabled = true;
      option.textContent = 'Nenhuma equipe encontrada';
      teamSelect.appendChild(option);
    }
  }

  attachEvents() {
    // Fechar o modal ao clicar no X
    const closeBtn = this.modal.querySelector('.close');
    closeBtn.onclick = () => this.close();
    
    // Fechar o modal ao clicar fora dele
    window.onclick = (event) => {
      if (event.target === this.modal) {
        this.close();
      }
    };
    
    // Fechar o modal ao clicar em cancelar
    const cancelBtn = this.modal.querySelector('#cancel-project');
    cancelBtn.onclick = () => this.close();
    
    // Submeter o formulário
    const form = this.modal.querySelector('#create-project-form');
    form.onsubmit = (e) => this.handleSubmit(e);
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    try {
      const projectData = {
        name: formData.get('name'),
        teamId: formData.get('teamId')
      };
      
      // Validar dados
      if (!projectData.name || !projectData.teamId) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
      }
      
      // Enviar para a API
      const response = await projectService.createProject(
        projectData.teamId,
        projectData.name,
        "", // Descrição vazia
        null // Sem data de conclusão
      );
      
      if (response) {
        alert('Projeto criado com sucesso!');
        this.close();
        
        // Redirecionar para a página do projeto se necessário
        if (response.project && response.project.id) {
          window.location.href = `../quadro/quadro.html?id=${response.project.id}`;
        } else {
          // Ou apenas recarregar a página atual
          window.location.reload();
        }
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
    if (this.modal) {
      this.modal.style.display = 'none';
      // Limpar o formulário
      this.modal.querySelector('#create-project-form').reset();
    }
  }
}

// Expor a classe globalmente para que possa ser acessada por outros scripts
window.ProjectModal = ProjectModal;
