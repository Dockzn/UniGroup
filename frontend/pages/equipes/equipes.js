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
        li.className = 'membro';

        li.innerHTML = `
            <div><span>👤</span> ${member.name}</div>
            <button data-userid="${member.id}" class="remove-button">❌ Remover</button>
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

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadTeamMembers();

    // Listener para remover membros
    document.getElementById('lista-membros').addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-button')) {
            const userId = e.target.dataset.userid;
            if (confirm('Tem certeza que deseja remover este membro?')) {
                removerMembro(userId);
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
