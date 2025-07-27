// Lista de membros simulada
const membros = ['Caroline', 'Lana', 'Aurora', 'Antônio'];

function renderizarMembros() {
  const lista = document.getElementById('lista-membros');
  const total = document.getElementById('total-membros');
  lista.innerHTML = '';

  membros.forEach((nome, index) => {
    const li = document.createElement('li');
    li.className = 'membro';

    li.innerHTML = `
      <div><span>👤</span> ${nome}</div>
      <button onclick="removerMembro(${index})">❌ Remover</button>
    `;

    lista.appendChild(li);
  });

  total.textContent = membros.length;
}

function removerMembro(index) {
  membros.splice(index, 1);
  renderizarMembros();
}

// Ação do botão de convite
document.addEventListener('DOMContentLoaded', () => {
  renderizarMembros();

  const botaoCopiar = document.getElementById('botao-convidar');
  const mensagem = document.getElementById('mensagem-copiado');

  botaoCopiar.addEventListener('click', () => {
    const link = 'exemplo';
    navigator.clipboard.writeText(link).then(() => {
      mensagem.style.display = 'inline';
      setTimeout(() => {
        mensagem.style.display = 'none';
      }, 2000);
    });
  });
});
