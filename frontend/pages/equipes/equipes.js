import { teamService } from '../../services/teamService.js';
import { checkAuth } from '../../services/authGuard.js';

let currentTeam = null;
let members = [];

if (!checkAuth()) {
    throw new Error('Unauthorized');
}

/**
 * Carrega os membros da equipe do usuário logado
 */
async function loadTeamMembers() {
    try {
        // Verificar se há um ID de equipe na URL
        const teamId = new URLSearchParams(window.location.search).get('id');
        
        if (!teamId) {
            // Se não tem ID na URL, buscar a equipe do usuário
            const userTeams = await teamService.listTeams();
            
            if (userTeams && userTeams.length > 0) {
                // Como cada usuário só pode ter uma equipe, pegamos a primeira (e única)
                currentTeam = userTeams[0].id;
                
                // Atualizar URL sem recarregar a página
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set('id', currentTeam);
                window.history.pushState({}, '', newUrl);
                
                // Carregar membros da equipe
                members = await teamService.getTeamMembers(currentTeam);
                renderizarMembros();
            } else {
                // O usuário não tem equipe, mostrar tela vazia
                members = [];
                currentTeam = null;
                renderizarMembros();
            }
            return;
        }

        // Se já tem ID na URL, carregar diretamente
        members = await teamService.getTeamMembers(teamId);
        currentTeam = teamId;
        renderizarMembros();
    } catch (error) {
        console.error('Erro ao carregar dados da equipe:', error);
        alert('Erro ao carregar dados da equipe');
    }
}

/**
 * Renderiza os membros da equipe na interface
 */
function renderizarMembros() {
    const lista = document.getElementById('lista-membros');
    const total = document.getElementById('total-membros');
    const cardEquipe = document.getElementById('card-equipe');
    const botaoAdicionar = document.getElementById('botao-adicionar');
    const botaoConvidar = document.getElementById('botao-convidar');
    
    // Limpar lista atual
    lista.innerHTML = '';
    
    // Se não tem equipe, mostrar mensagem
    if (!currentTeam) {
        lista.innerHTML = '<p class="no-team">Você não está em nenhuma equipe.</p>';
        total.textContent = '0';
        
        // Desabilitar botões de adicionar
        if (botaoAdicionar) botaoAdicionar.disabled = true;
        if (botaoConvidar) botaoConvidar.disabled = true;
        return;
    }
    
    // Reabilitar botões se necessário
    if (botaoAdicionar) botaoAdicionar.disabled = false;
    if (botaoConvidar) botaoConvidar.disabled = false;

    // Adicionar cada membro à lista
    members.forEach(member => {
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

        lista.appendChild(li);
    });

    // Atualizar contador de membros
    total.textContent = members.length;
}

async function removerMembro(userId) {
    try {
        await teamService.removeMember(currentTeam, userId);
        members = members.filter(member => member.id !== userId);
        renderizarMembros();
    } catch (error) {
        console.error('Erro ao remover membro:', error);
        alert('Erro ao remover membro da equipe');
    }
}

async function adicionarMembroPorEmail(email) {
    try {
        const response = await teamService.addMemberByEmail(currentTeam, email);
        if (response.success) {
            // Adiciona o novo membro à lista
            members.push(response.member);
            renderizarMembros();
            
            // Mostra mensagem de sucesso
            const mensagem = document.getElementById('mensagem-adicao');
            mensagem.textContent = 'Membro adicionado com sucesso!';
            mensagem.className = 'sucesso';
            mensagem.style.display = 'block';
            
            document.getElementById('email-membro').value = '';
            
            setTimeout(() => {
                mensagem.style.display = 'none';
            }, 3000);
        }
    } catch (error) {
        const mensagem = document.getElementById('mensagem-adicao');
        mensagem.textContent = error.message || 'Erro ao adicionar membro';
        mensagem.className = 'erro';
        mensagem.style.display = 'block';
        
        setTimeout(() => {
            mensagem.style.display = 'none';
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;

    // Carregar dados da equipe do usuário
    loadTeamMembers();

    // Listener para tecla Enter no campo de email
    const emailInput = document.getElementById('email-membro');
    if (emailInput) {
        emailInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const email = emailInput.value.trim();
                
                if (!currentTeam) {
                    const mensagem = document.getElementById('mensagem-adicao');
                    mensagem.textContent = 'Você não está em nenhuma equipe';
                    mensagem.className = 'erro';
                    mensagem.style.display = 'block';
                    return;
                }
                
                if (email) {
                    await adicionarMembroPorEmail(email);
                }
            }
        });
    }

    // Listener para adicionar membro por email
    const botaoAdicionar = document.getElementById('botao-adicionar');
    if (botaoAdicionar) {
        botaoAdicionar.addEventListener('click', async () => {
            if (!currentTeam) {
                const mensagem = document.getElementById('mensagem-adicao');
                mensagem.textContent = 'Você não está em nenhuma equipe';
                mensagem.className = 'erro';
                mensagem.style.display = 'block';
                return;
            }
            
            const emailInput = document.getElementById('email-membro');
            const email = emailInput.value.trim();
            
            if (!email) {
                const mensagem = document.getElementById('mensagem-adicao');
                mensagem.textContent = 'Por favor, insira um email válido';
                mensagem.className = 'erro';
                mensagem.style.display = 'block';
                return;
            }
            
            await adicionarMembroPorEmail(email);
        });
    }


    const listaMembros = document.getElementById('lista-membros');
    if (listaMembros) {
        listaMembros.addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-remover')) {
                const userId = e.target.dataset.userid;
                if (confirm('Tem certeza que deseja remover este membro?')) {
                    await removerMembro(userId);
                }
            } else if (e.target.classList.contains('btn-sair')) {
                if (confirm('Tem certeza que deseja sair desta equipe?')) {
                    try {
                        await teamService.leaveTeam(currentTeam);
                        window.location.href = '../inicio/inicio.html';
                    } catch (error) {
                        console.error('Erro ao sair da equipe:', error);
                        alert('Erro ao sair da equipe');
                    }
                }
            }
        });
    }

    const botaoCopiar = document.getElementById('botao-convidar');
    const mensagem = document.getElementById('mensagem-copiado');

    if (botaoCopiar && mensagem) {
        botaoCopiar.addEventListener('click', async () => {
            try {
                if (!currentTeam) {
                    alert('Você não está em nenhuma equipe');
                    return;
                }
                
                const team = await teamService.getTeamDetails(currentTeam);
                const link = `${window.location.origin}/equipes/join.html?code=${team.inviteCode}`;
                
                await navigator.clipboard.writeText(link);
                mensagem.style.display = 'inline';
                setTimeout(() => {
                    mensagem.style.display = 'none';
                }, 2000);
            } catch (error) {
                console.error('Erro ao copiar link de convite:', error);
                alert('Erro ao gerar link de convite');
            }
        });
    }
});
