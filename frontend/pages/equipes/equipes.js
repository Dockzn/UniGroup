const IS_LOCAL = false;
const API_URL = IS_LOCAL ? 'http://localhost:3000' : 'https://unigroup.onrender.com';
let currentTeamId = null;
let currentUserId = null;

window.addEventListener('DOMContentLoaded', async () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userObj = JSON.parse(user);
      currentUserId = userObj.id;
      if (userObj.team_id) {
        currentTeamId = userObj.team_id;
        await exibirNomeEquipe(userObj.team_id); // Nova função
        await loadMembers();
      } else {
        // Sem equipe - mostrar nome padrão
        atualizarTituloEquipe('Equipe');
        loadMembers(); // Vai mostrar 0 membros
      }
    } catch (e) {
      currentUserId = null;
      atualizarTituloEquipe('Equipe');
      loadMembers();
    }
  } else {
    atualizarTituloEquipe('Equipe');
    loadMembers();
  }
});

// 🆕 Nova função para buscar só o nome da equipe
async function exibirNomeEquipe(teamId) {
  try {
    const resTeam = await fetch(`${API_URL}/api/teams/${teamId}`);
    if (resTeam.ok) {
      const team = await resTeam.json();
      atualizarTituloEquipe(team.name || 'Equipe');
    } else {
      atualizarTituloEquipe('Equipe');
    }
  } catch (e) {
    atualizarTituloEquipe('Equipe');
  }
}

// 🆕 Função para atualizar o título dinamicamente
function atualizarTituloEquipe(nomeEquipe) {
  const titulo = document.querySelector('.equipes h1');
  if (titulo) {
    titulo.innerHTML = `<i class="fa-solid fa-user-group"></i> ${nomeEquipe}`;
  }
}

const criarEquipeBtn = document.getElementById('criarEquipeBtn');
if (criarEquipeBtn) {
  criarEquipeBtn.onclick = async () => {
    const name = document.getElementById('nomeEquipe').value.trim();
    if (!name) return showMsg('msgCriarEquipe', 'Digite o nome da equipe', true);
    try {
      const res = await fetch(`${API_URL}/api/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, userId: currentUserId })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        showMsg('msgCriarEquipe', data.error || 'Erro ao criar equipe', true);
        return;
      }
      currentTeamId = data.id;
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userObj = JSON.parse(user);
          userObj.team_id = data.id;
          localStorage.setItem('user', JSON.stringify(userObj));
        } catch (e) { }
      }
      showMsg('msgCriarEquipe', 'Equipe criada com sucesso!', false);
      document.getElementById('nomeEquipe').value = '';

      // Atualizar título e membros
      atualizarTituloEquipe(name);
      await loadMembers();
    } catch (e) {
      showMsg('msgCriarEquipe', 'Erro de conexão com o servidor', true);
    }
  };
}

const botaoAdicionar = document.getElementById('botao-adicionar');
if (botaoAdicionar) {
  botaoAdicionar.onclick = async () => {
    const email = document.getElementById('email-membro').value.trim();
    if (!email) return showMsg('mensagem-adicao', 'Digite o email do usuário', true);
    if (!currentTeamId) return showMsg('mensagem-adicao', 'Crie uma equipe primeiro!', true);

    try {
      const res = await fetch(`${API_URL}/api/teams/${currentTeamId}/add-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        showMsg('mensagem-adicao', data.error || 'Erro ao adicionar membro', true);
        return;
      }
      showMsg('mensagem-adicao', 'Membro adicionado com sucesso!', false);
      document.getElementById('email-membro').value = '';

      await loadMembers();

    } catch (e) {
      showMsg('mensagem-adicao', 'Erro de conexão com o servidor', true);
    }
  };
}

async function loadMembers() {
  if (!currentTeamId) {
    document.getElementById('lista-membros').innerHTML = '';
    document.getElementById('total-membros').textContent = '0';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/teams/${currentTeamId}/members`);
    if (!res.ok) {
      document.getElementById('lista-membros').innerHTML = '';
      document.getElementById('total-membros').textContent = '0';
      return;
    }

    const users = await res.json().catch(() => []);
    const ul = document.getElementById('lista-membros');
    ul.innerHTML = '';

    users.forEach(u => {
      const li = document.createElement('li');
      li.className = 'membro-item';
      li.innerHTML = `
        <span class="membro-avatar"><i class="fas fa-user"></i></span>
        <span class="membro-nome">${u.name} (${u.email})</span>
      `;
      ul.appendChild(li);
    });

    document.getElementById('total-membros').textContent = users.length;
  } catch (e) {
    console.error('Erro ao carregar membros:', e);
    document.getElementById('lista-membros').innerHTML = '';
    document.getElementById('total-membros').textContent = '0';
  }
}

function showMsg(id, msg, isError) {
  const el = document.getElementById(id);
  el.style.display = 'inline';
  el.style.color = isError ? 'red' : 'green';
  el.textContent = msg;
  setTimeout(() => { el.style.display = 'none'; }, 2500);
}