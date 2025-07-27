/**
 * Gerenciador de equipes - interface do usuário
 * 
 * Este módulo implementa a interface de usuário para gerenciar equipes,
 * permitindo adicionar, remover membros e gerenciar convites.
 */
import { teamService } from '../../services/teamService.js';

/**
 * Controlador da página de equipes
 */
class TeamController {
    constructor() {
        this.currentTeam = null;
        this.members = [];
        this.messageTimeout = null;
    }

    /**
     * Inicializa os componentes e carrega os dados iniciais
     */
    async init() {
        // Carregar equipe e membros
        await this.loadTeam();
        
        // Configurar event listeners
        this.setupEventListeners();
    }
    
    /**
     * Configura todos os listeners de eventos da página
     */
    setupEventListeners() {
        // Adicionar membro via input de email
        const emailInput = document.getElementById('email-membro');
        const addButton = document.getElementById('botao-adicionar');
        
        // Listener para tecla Enter no campo de email
        if (emailInput) {
            emailInput.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    await this.handleAddMember();
                }
            });
        }
        
        // Listener para botão de adicionar
        if (addButton) {
            addButton.addEventListener('click', async () => {
                await this.handleAddMember();
            });
        }
        
        // Listener para ações em membros (remover ou sair)
        const membersList = document.getElementById('lista-membros');
        if (membersList) {
            membersList.addEventListener('click', async (e) => {
                // Remover membro
                if (e.target.classList.contains('btn-remover')) {
                    const userId = e.target.dataset.userid;
                    if (confirm('Tem certeza que deseja remover este membro?')) {
                        await this.removeMember(userId);
                    }
                } 
                // Sair da equipe
                else if (e.target.classList.contains('btn-sair')) {
                    if (confirm('Tem certeza que deseja sair desta equipe?')) {
                        await this.leaveTeam();
                    }
                }
            });
        }
        
        // Listener para botão de convite
        const inviteButton = document.getElementById('botao-convidar');
        if (inviteButton) {
            inviteButton.addEventListener('click', async () => {
                await this.generateInviteLink();
            });
        }
    }
    
    /**
     * Carrega a equipe do usuário e seus membros
     */
    async loadTeam() {
        try {
            // Buscar a equipe do usuário
            const teams = await teamService.getUserTeam();
            
            if (teams && teams.length > 0) {
                // O usuário tem uma equipe
                this.currentTeam = teams[0].id;
                
                // Carregar membros da equipe
                this.members = await teamService.getTeamMembers(this.currentTeam);
                this.renderMembers();
            } else {
                // O usuário não tem equipe, criar uma automaticamente
                await this.createDefaultTeam();
            }
        } catch (error) {
            this.showMessage('Erro ao carregar equipe: ' + error.message, 'erro');
            console.error('Erro ao carregar equipe:', error);
        }
    }
    
    /**
     * Cria uma equipe padrão para o usuário
     */
    async createDefaultTeam() {
        try {
            // Obter dados do usuário para nome da equipe
            const currentUser = JSON.parse(localStorage.getItem('user')) || {};
            const userName = currentUser.name || 'Usuário';
            
            // Criar equipe
            const response = await teamService.createTeam(
                `Equipe de ${userName}`,
                `Equipe padrão criada para ${userName}`
            );
            
            if (response && response.team && response.team.id) {
                this.currentTeam = response.team.id;
                this.members = await teamService.getTeamMembers(this.currentTeam);
                this.renderMembers();
                this.showMessage('Equipe criada com sucesso', 'sucesso');
            } else {
                throw new Error('Não foi possível criar a equipe');
            }
        } catch (error) {
            this.currentTeam = null;
            this.members = [];
            this.renderMembers();
            this.showMessage('Erro ao criar equipe: ' + error.message, 'erro');
            console.error('Erro ao criar equipe:', error);
        }
    }
    
    /**
     * Processa a adição de um novo membro via email
     */
    async handleAddMember() {
        const emailInput = document.getElementById('email-membro');
        if (!emailInput) return;
        
        const email = emailInput.value.trim();
        if (!email) {
            this.showMessage('Por favor, insira um email válido', 'erro');
            return;
        }
        
        await this.addMemberByEmail(email);
    }
    
    /**
     * Adiciona um novo membro à equipe via email
     * @param {string} email - Email do usuário a ser adicionado
     */
    async addMemberByEmail(email) {
        try {
            // Se não tem equipe, criar uma nova
            if (!this.currentTeam) {
                this.showMessage('Criando equipe...', 'info');
                await this.createDefaultTeam();
                
                if (!this.currentTeam) {
                    throw new Error('Não foi possível criar uma equipe');
                }
            }
            
            // Adicionar membro
            const response = await teamService.addMemberByEmail(this.currentTeam, email);
            
            if (response && response.success) {
                // Adicionar novo membro à lista
                this.members.push(response.member);
                this.renderMembers();
                
                // Limpar campo e mostrar mensagem
                document.getElementById('email-membro').value = '';
                this.showMessage('Membro adicionado com sucesso', 'sucesso');
            } else {
                throw new Error(response?.message || 'Erro ao adicionar membro');
            }
        } catch (error) {
            this.showMessage('Erro ao adicionar membro: ' + error.message, 'erro');
            console.error('Erro ao adicionar membro:', error);
        }
    }
    
    /**
     * Remove um membro da equipe
     * @param {string} userId - ID do usuário a ser removido
     */
    async removeMember(userId) {
        try {
            await teamService.removeMember(this.currentTeam, userId);
            this.members = this.members.filter(member => member.id !== userId);
            this.renderMembers();
            this.showMessage('Membro removido com sucesso', 'sucesso');
        } catch (error) {
            this.showMessage('Erro ao remover membro: ' + error.message, 'erro');
            console.error('Erro ao remover membro:', error);
        }
    }
    
    /**
     * Sai da equipe atual
     */
    async leaveTeam() {
        try {
            await teamService.leaveTeam(this.currentTeam);
            this.currentTeam = null;
            this.members = [];
            this.renderMembers();
            this.showMessage('Você saiu da equipe com sucesso', 'sucesso');
        } catch (error) {
            this.showMessage('Erro ao sair da equipe: ' + error.message, 'erro');
            console.error('Erro ao sair da equipe:', error);
        }
    }
    
    /**
     * Gera e copia um link de convite para a equipe
     */
    async generateInviteLink() {
        try {
            if (!this.currentTeam) {
                this.showMessage('Você não está em nenhuma equipe', 'erro');
                return;
            }
            
            const team = await teamService.getTeamDetails(this.currentTeam);
            const inviteLink = `${window.location.origin}/equipes/join.html?code=${team.inviteCode}`;
            
            await navigator.clipboard.writeText(inviteLink);
            
            const msgElement = document.getElementById('mensagem-copiado');
            if (msgElement) {
                msgElement.style.display = 'inline';
                setTimeout(() => {
                    msgElement.style.display = 'none';
                }, 2000);
            }
        } catch (error) {
            this.showMessage('Erro ao gerar link de convite: ' + error.message, 'erro');
            console.error('Erro ao gerar link de convite:', error);
        }
    }
    
    /**
     * Exibe mensagem na interface
     * @param {string} text - Texto da mensagem
     * @param {string} type - Tipo da mensagem ('sucesso', 'erro', 'info')
     */
    showMessage(text, type = 'info') {
        const msgElement = document.getElementById('mensagem-adicao');
        if (!msgElement) return;
        
        // Limpar timeout anterior se existir
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }
        
        msgElement.textContent = text;
        msgElement.className = type;
        msgElement.style.display = 'block';
        
        this.messageTimeout = setTimeout(() => {
            msgElement.style.display = 'none';
        }, 3000);
    }
    
    /**
     * Renderiza a lista de membros na interface
     */
    renderMembers() {
        const list = document.getElementById('lista-membros');
        const total = document.getElementById('total-membros');
        const addButton = document.getElementById('botao-adicionar');
        const inviteButton = document.getElementById('botao-convidar');
        
        if (!list || !total) return;
        
        // Limpar lista
        list.innerHTML = '';
        
        // Verificar se existe uma equipe
        if (!this.currentTeam) {
            list.innerHTML = '<p class="no-team">Você não está em nenhuma equipe.</p>';
            total.textContent = '0';
            
            // Desabilitar botões
            if (addButton) addButton.disabled = true;
            if (inviteButton) inviteButton.disabled = true;
            return;
        }
        
        // Habilitar botões
        if (addButton) addButton.disabled = false;
        if (inviteButton) inviteButton.disabled = false;
        
        // Renderizar membros
        this.members.forEach(member => {
            const li = document.createElement('li');
            li.className = 'membro-item';
            
            const isOwner = member.role === 'owner';
            const buttonText = isOwner ? 'Sair da equipe' : 'Remover membro';
            
            li.innerHTML = `
                <span class="membro-avatar">👤</span>
                <span class="membro-nome">${member.name}</span>
                <button class="${isOwner ? 'btn-sair' : 'btn-remover'}" data-userid="${member.id}">
                    ${buttonText}
                </button>
            `;
            
            list.appendChild(li);
        });
        
        // Atualizar contador
        total.textContent = this.members.length;
    }
}

// Inicializar controller quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const controller = new TeamController();
    controller.init();
});
