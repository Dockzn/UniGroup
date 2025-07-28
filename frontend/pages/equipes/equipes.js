const IS_LOCAL = false; // Definido como true para usar o servidor local
const API_URL = IS_LOCAL ? 'http://localhost:3000' : 'https://unigroup.onrender.com';
let currentTeamId = null;
let currentUserId = null;

// Ao carregar a página, pega o userId do localStorage (após login) e exibe info da equipe
window.addEventListener('DOMContentLoaded', async () => {
  const user = localStorage.getItem('user');
  const infoDiv = document.getElementById('minha-equipe-info');
  if (user) {
    try {
      const userObj = JSON.parse(user);
      currentUserId = userObj.id;
      if (userObj.team_id) {
        currentTeamId = userObj.team_id;
        await exibirMinhaEquipe(userObj.team_id);
      } else {
        if (infoDiv) {
          infoDiv.style.display = 'block';
          document.getElementById('minha-equipe-nome').textContent = '';
          document.getElementById('minha-equipe-membros').innerHTML = '<span style="color:#888">Você ainda não está em nenhuma equipe.</span>';
        }
      }
    } catch (e) {
      currentUserId = null;
      if (infoDiv) infoDiv.style.display = 'none';
    }
  } else {
    if (infoDiv) infoDiv.style.display = 'none';
  }
});

async function exibirMinhaEquipe(teamId) {
  try {
    // Buscar equipe (nome)
    const resTeam = await fetch(`${API_URL}/api/teams/${teamId}`);
    let teamName = '';
    if (resTeam.ok) {
      const team = await resTeam.json();
      teamName = team.name || '';
    }
    // Buscar membros
    const resMembros = await fetch(`${API_URL}/api/teams/${teamId}/members`);
    let membros = [];
    if (resMembros.ok) {
      membros = await resMembros.json();
    }
    // Exibir na tela
    const infoDiv = document.getElementById('minha-equipe-info');
    if (infoDiv) {
      infoDiv.style.display = 'block';
      document.getElementById('minha-equipe-nome').textContent = `Nome: ${teamName}`;
      document.getElementById('minha-equipe-membros').innerHTML =
        `<b>Total de membros:</b> ${membros.length}<br><b>Nomes:</b> ${membros.map(m => m.name).join(', ')}`;
    }
  } catch (e) {
    // Oculta info se erro
    const infoDiv = document.getElementById('minha-equipe-info');
    if (infoDiv) infoDiv.style.display = 'none';
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
        } catch (e) {}
      }
      showMsg('msgCriarEquipe', 'Equipe criada!', false);
      document.getElementById('nomeEquipe').value = '';
      await exibirMinhaEquipe(data.id);
      loadMembers();
    } catch (e) {
      showMsg('msgCriarEquipe', 'Erro de conexão com o servidor', true);
    }
  };
}

// Adicionar membro
const botaoAdicionar = document.getElementById('botao-adicionar');
if (botaoAdicionar) {
  botaoAdicionar.onclick = async () => {
    const email = document.getElementById('email-membro').value.trim();
    if (!email) return showMsg('mensagem-adicao', 'Digite o email do usuário', true);
    if (!currentTeamId) return showMsg('mensagem-adicao', 'Crie uma equipe primeiro!', true);
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
    showMsg('mensagem-adicao', 'Membro adicionado!', false);
    document.getElementById('email-membro').value = '';
    // Atualiza a página para refletir mudanças de equipe
    setTimeout(() => { window.location.reload(); }, 1000);
  };
}

// Listar membros
async function loadMembers() {
  if (!currentTeamId) {
    document.getElementById('lista-membros').innerHTML = '';
    document.getElementById('total-membros').textContent = '0';
    return;
  }
  const res = await fetch(`/api/teams/${currentTeamId}/members`);
  if (!res.ok) return;
  const users = await res.json().catch(() => []);
  const ul = document.getElementById('lista-membros');
  ul.innerHTML = '';
  users.forEach(u => {
    const li = document.createElement('li');
    li.textContent = u.name + ' (' + u.email + ')';
    ul.appendChild(li);
  });
  document.getElementById('total-membros').textContent = users.length;
}

function showMsg(id, msg, isError) {
  const el = document.getElementById(id);
  el.style.display = 'inline';
  el.style.color = isError ? 'red' : 'green';
  el.textContent = msg;
  setTimeout(() => { el.style.display = 'none'; }, 2500);
}
