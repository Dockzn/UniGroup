import { teamService } from '../../services/teamService.js';

let currentTeam = null;
let members = [];

async function loadTeamMembers() {
    try {
        const teamId = new URLSearchParams(window.location.search).get('id');
        if (!teamId) {
            console.error('ID da equipe não fornecido');
            return;
        }

        members = await teamService.getTeamMembers(teamId);
        currentTeam = teamId;
        renderizarMembros();
    } catch (error) {
        console.error('Erro ao carregar membros:', error);
        alert('Erro ao carregar membros da equipe');
    }
}

function renderizarMembros() {
    const lista = document.getElementById('lista-membros');
    const total = document.getElementById('total-membros');
    lista.innerHTML = '';

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
            
            // Limpa o campo de email
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

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadTeamMembers();

    // Listener para remover membros ou sair da equipe
    // Listener para adicionar membro por email
    document.getElementById('botao-adicionar').addEventListener('click', async () => {
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

    document.getElementById('lista-membros').addEventListener('click', async (e) => {
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

    // Botão de convite
    const botaoCopiar = document.getElementById('botao-convidar');
    const mensagem = document.getElementById('mensagem-copiado');

    botaoCopiar.addEventListener('click', async () => {
        try {
            const teamId = new URLSearchParams(window.location.search).get('id');
            const team = await teamService.getTeamDetails(teamId);
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
});
