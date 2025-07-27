
// Mock data
let projectData = {};

function getProjectIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('projectId');
}

async function loadProjectData(projectId) {
    // Substituir os dados abaixo pela chamada da API

    if (projectId === "1") {
        projectData = {
            name: "Desenvolvimento Web",
            members: [
                { id: 1, name: "João Silva" },
                { id: 2, name: "Maria Santos" },
                { id: 3, name: "Pedro Costa" },
                { id: 4, name: "Ana Lima" }
            ],
            lists: [
                {
                    id: 1,
                    title: "Planejamento",
                    activities: [
                        {
                            id: 1,
                            title: "Definir escopo do projeto",
                            description: "Reunir com stakeholders e definir todos os requisitos do projeto",
                            date: "10 de julho",
                            priority: "media",
                            assignedUsers: [1, 2],
                            completed: false
                        },
                        {
                            id: 2,
                            title: "Criar estrutura inicial",
                            description: "Configurar ambiente de desenvolvimento e estrutura de pastas",
                            date: "11 de julho",
                            priority: "baixa",
                            assignedUsers: [3],
                            completed: false
                        },
                        {
                            id: 3,
                            title: "Reunir requisitos com o cliente",
                            description: "Sessão de levantamento de requisitos funcionais e não funcionais",
                            date: "12 de julho",
                            priority: "alta",
                            assignedUsers: [1],
                            completed: false
                        }
                    ]
                },
                {
                    id: 2,
                    title: "Backlog",
                    activities: [
                        {
                            id: 4,
                            title: "Desenhar wireframe da home",
                            description: "Criar wireframes responsivos para desktop e mobile",
                            date: "14 de julho",
                            priority: "media",
                            assignedUsers: [2],
                            completed: false
                        },
                        {
                            id: 5,
                            title: "Especificar funcionalidades do login",
                            description: "Documentar fluxo de autenticação e autorização",
                            date: "",
                            priority: "baixa",
                            assignedUsers: [],
                            completed: false
                        }
                    ]
                },
                {
                    id: 3,
                    title: "Em desenvolvimento",
                    activities: [
                        {
                            id: 6,
                            title: "Implementar layout responsivo da landing page",
                            description: "Desenvolver página inicial com design responsivo",
                            date: "15 de julho",
                            priority: "alta",
                            assignedUsers: [1, 3],
                            completed: false
                        },
                        {
                            id: 7,
                            title: "Criar componentes do header e footer",
                            description: "Componentizar elementos reutilizáveis da interface",
                            date: "15 de julho",
                            priority: "media",
                            assignedUsers: [4],
                            completed: false
                        },
                        {
                            id: 8,
                            title: "Integrar API de autenticação",
                            description: "Implementar login/logout e gerenciamento de sessão",
                            date: "16 de julho",
                            priority: "alta",
                            assignedUsers: [2, 3],
                            completed: false
                        }
                    ]
                },
                {
                    id: 4,
                    title: "Concluído",
                    activities: [
                        {
                            id: 9,
                            title: "Setup inicial do projeto (HTML, CSS, JS)",
                            description: "Configuração inicial do projeto com estrutura base",
                            date: "09 de julho",
                            priority: "media",
                            assignedUsers: [1],
                            completed: true
                        },
                        {
                            id: 10,
                            title: "Criação do repositório no GitHub",
                            description: "Configurar repositório e estrutura de versionamento",
                            date: "09 de julho",
                            priority: "baixa",
                            assignedUsers: [1],
                            completed: true
                        },
                        {
                            id: 11,
                            title: "Configuração do ambiente de desenvolvimento",
                            description: "Instalar e configurar ferramentas de desenvolvimento",
                            date: "10 de julho",
                            priority: "media",
                            assignedUsers: [1, 3],
                            completed: true
                        }
                    ]
                }
            ]
        };
    } else if (projectId === "2") {
        projectData = {
            name: "Projeto de Marketing",
            members: [
                { id: 1, name: "Carlos Silva" },
                { id: 2, name: "Lucia Santos" }
            ],
            lists: [
                {
                    id: 1,
                    title: "Planejamento",
                    activities: [
                        {
                            id: 1,
                            title: "Criar campanha publicitária",
                            description: "Desenvolver estratégia de marketing digital",
                            date: "20 de julho",
                            priority: "alta",
                            assignedUsers: [1],
                            completed: false
                        }
                    ]
                }
            ]
        };
    } else {
        projectData = {
            name: "Projeto desconhecido",
            members: [],
            lists: []
        };
    }
}

// Variables
let draggedActivity = null;
let draggedList = null;
let nextActivityId = 12;
let nextListId = 5;

// DOM Elements
const board = document.getElementById('board');
const activityModal = document.getElementById('activityModal');
const viewActivityModal = document.getElementById('viewActivityModal');
const listModal = document.getElementById('listModal');
const activityForm = document.getElementById('activityForm');
const listForm = document.getElementById('listForm');

// Initialize
document.addEventListener('DOMContentLoaded', async function () {
    const projectId = getProjectIdFromURL();
    if (projectId) {
        await loadProjectData(projectId);
    }
    renderBoard();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Modal controls
    document.getElementById('closeModal').addEventListener('click', closeActivityModal);
    document.getElementById('closeViewModal').addEventListener('click', closeViewActivityModal);
    document.getElementById('closeListModal').addEventListener('click', closeListModal);
    document.getElementById('cancelBtn').addEventListener('click', closeActivityModal);
    document.getElementById('cancelListBtn').addEventListener('click', closeListModal);

    // Verificar se o botão de membros existe antes de adicionar o listener
    const btnMembers = document.getElementById('btnMembers');
    if (btnMembers) {
        btnMembers.addEventListener('click', toggleMembersPopup);
    }

    const closeMembersBtn = document.getElementById('closeMembersPopup');
    if (closeMembersBtn) {
        closeMembersBtn.addEventListener('click', closeMembersPopup);
    }

    // Header actions
    const btnCreateList = document.querySelector('.btn-create-list');
    if (btnCreateList) {
        btnCreateList.addEventListener('click', openListModal);
    }

    // Form submissions
    activityForm.addEventListener('submit', handleActivitySubmit);
    listForm.addEventListener('submit', handleListSubmit);

    // View modal actions
    document.getElementById('editFromViewBtn').addEventListener('click', editFromView);
    document.getElementById('deleteFromViewBtn').addEventListener('click', deleteFromView);

    // Fechar popup ao clicar fora
    document.addEventListener('click', function (e) {
        const popup = document.getElementById('membersPopup');
        const btn = document.getElementById('btnMembers');
        if (popup && btn && !popup.contains(e.target) && !btn.contains(e.target)) {
            closeMembersPopup();
        }
    });

    // Close modal when clicking outside
    window.addEventListener('click', function (e) {
        if (e.target === activityModal) closeActivityModal();
        if (e.target === viewActivityModal) closeViewActivityModal();
        if (e.target === listModal) closeListModal();
    });
}

// Render Functions
function renderBoard() {
    const projectTitle = document.querySelector('.project-title');
    if (projectTitle) {
        projectTitle.textContent = projectData.name || 'Projeto';
    }

    board.innerHTML = '';

    projectData.lists.forEach(list => {
        const listElement = createListElement(list);
        board.appendChild(listElement);
    });

    updateListSelectors();
}

function createListElement(list) {
    const listDiv = document.createElement('div');
    listDiv.className = 'list-column';
    listDiv.setAttribute('data-list-id', list.id);
    listDiv.draggable = true;

    listDiv.innerHTML = `
        <div class="list-header" onclick="startEditListTitle(${list.id})">
            <input type="text" class="list-title" value="${list.title}"
                   onblur="finishEditListTitle(${list.id}, this.value)"
                   onkeypress="handleListTitleKeypress(event, ${list.id}, this.value)"
                   readonly>
        </div>
        <div class="list-content" data-list-id="${list.id}">
            ${list.activities.map(activity => createActivityHTML(activity)).join('')}
            <button class="add-activity-btn" onclick="openActivityModal(${list.id})">
                <i class="fas fa-plus"></i>
                <span>Adicionar nova atividade</span>
            </button>
        </div>
    `;

    setupListDropZone(listDiv.querySelector('.list-content'));
    setupListDragEvents(listDiv);

    return listDiv;
}

function createActivityHTML(activity) {
    const priorityClass = activity.priority ? `priority-${activity.priority}` : '';
    const completedClass = activity.completed ? 'completed' : '';

    return `
        <div class="activity-card ${priorityClass} ${completedClass}"
             draggable="true"
             data-activity-id="${activity.id}"
             onclick="viewActivity(${activity.id})">
            <div class="activity-header">
                <div class="activity-checkbox-wrapper">
                    <input type="checkbox"
                           class="activity-checkbox"
                           ${activity.completed ? 'checked' : ''}
                           onchange="toggleActivityComplete(${activity.id})"
                           onclick="event.stopPropagation()">
                </div>
                <div class="activity-title">${activity.title}</div>
                <div class="activity-actions">
                    <i class="fas fa-pencil-alt edit-btn" title="Editar" onclick="event.stopPropagation(); editActivity(${activity.id})"></i>
                    <i class="fas fa-trash delete-btn" title="Excluir" onclick="event.stopPropagation(); deleteActivity(${activity.id})"></i>
                </div>
            </div>
            ${(activity.date && !activity.completed) || (activity.priority && !activity.completed) ? `
                <div class="activity-meta">
                    ${activity.date && !activity.completed ? `
                        <div class="activity-date">
                            <i class="fas fa-clock"></i>
                            <span>${activity.date}</span>
                        </div>
                    ` : ''}
                    ${activity.priority && !activity.completed ? `
                        <div class="priority-badge ${activity.priority}">${getPriorityLabel(activity.priority)}</div>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;
}

function getPriorityLabel(priority) {
    const labels = {
        'baixa': 'Baixa',
        'media': 'Média',
        'alta': 'Alta'
    };
    return labels[priority] || 'Normal';
}

// List Management
function startEditListTitle(listId) {
    const listElement = document.querySelector(`[data-list-id="${listId}"] .list-title`);
    const headerElement = document.querySelector(`[data-list-id="${listId}"] .list-header`);

    listElement.removeAttribute('readonly');
    listElement.focus();
    listElement.select();
    headerElement.classList.add('editing');
}

async function finishEditListTitle(listId, newTitle) {
    const listElement = document.querySelector(`[data-list-id="${listId}"] .list-title`);
    const headerElement = document.querySelector(`[data-list-id="${listId}"] .list-header`);

    if (newTitle.trim() !== '') {
        try {
            // TODO: Substituir pela chamada real da API
            // await fetch(`/api/lists/${listId}`, {
            //     method: 'PUT',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`
            //     },
            //     body: JSON.stringify({ title: newTitle.trim() })
            // });

            // Atualizar localmente (manter até ter API)
            const list = projectData.lists.find(l => l.id === listId);
            if (list) {
                list.title = newTitle.trim();
                listElement.value = newTitle.trim();
            }
        } catch (error) {
            console.error('Erro ao renomear lista:', error);
            alert('Erro ao renomear lista. Tente novamente.');
            // Reverter o título em caso de erro
            const list = projectData.lists.find(l => l.id === listId);
            if (list) {
                listElement.value = list.title;
            }
        }
    }

    listElement.setAttribute('readonly', true);
    headerElement.classList.remove('editing');
    updateListSelectors();
}

function handleListTitleKeypress(event, listId, value) {
    if (event.key === 'Enter') {
        event.preventDefault();
        finishEditListTitle(listId, value);
    } else if (event.key === 'Escape') {
        event.preventDefault();
        const list = projectData.lists.find(l => l.id === listId);
        const listElement = document.querySelector(`[data-list-id="${listId}"] .list-title`);
        listElement.value = list.title;
        finishEditListTitle(listId, list.title);
    }
}

// List Drag and Drop
function setupListDragEvents(listElement) {
    listElement.addEventListener('dragstart', handleListDragStart);
    listElement.addEventListener('dragend', handleListDragEnd);
    listElement.addEventListener('dragover', handleListDragOver);
    listElement.addEventListener('drop', handleListDrop);
}

function handleListDragStart(e) {
    if (e.target.classList.contains('list-column')) {
        draggedList = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }
}

function handleListDragEnd(e) {
    if (e.target.classList.contains('list-column')) {
        e.target.classList.remove('dragging');
        draggedList = null;
    }
}

function handleListDragOver(e) {
    if (draggedList && e.currentTarget.classList.contains('list-column')) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
}

function handleListDrop(e) {
    e.preventDefault();

    if (draggedList && e.currentTarget.classList.contains('list-column') && draggedList !== e.currentTarget) {
        const draggedId = parseInt(draggedList.getAttribute('data-list-id'));
        const targetId = parseInt(e.currentTarget.getAttribute('data-list-id'));

        reorderLists(draggedId, targetId);
        renderBoard();
    }
}

async function reorderLists(draggedId, targetId) {
    try {
        const draggedIndex = projectData.lists.findIndex(l => l.id === draggedId);
        const targetIndex = projectData.lists.findIndex(l => l.id === targetId);

        if (draggedIndex !== -1 && targetIndex !== -1) {
            // TODO: Substituir pela chamada real da API
            // await fetch('/api/lists/reorder', {
            //     method: 'PUT',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`
            //     },
            //     body: JSON.stringify({
            //         projectId: getProjectIdFromURL(),
            //         fromIndex: draggedIndex,
            //         toIndex: targetIndex
            //     })
            // });

            // Reordenar localmente (manter até ter API)
            const [draggedList] = projectData.lists.splice(draggedIndex, 1);
            projectData.lists.splice(targetIndex, 0, draggedList);
        }
    } catch (error) {
        console.error('Erro ao reordenar listas:', error);
        alert('Erro ao reordenar listas. Tente novamente.');
        renderBoard(); // Reverter em caso de erro
    }
}

// Activity Drag and Drop
function setupListDropZone(container) {
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);
    container.addEventListener('dragleave', handleDragLeave);

    // Setup activity drag events
    container.addEventListener('dragstart', handleDragStart);
    container.addEventListener('dragend', handleDragEnd);
}

function handleDragStart(e) {
    if (e.target.classList.contains('activity-card')) {
        draggedActivity = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }
}

function handleDragEnd(e) {
    if (e.target.classList.contains('activity-card')) {
        e.target.classList.remove('dragging');
        draggedActivity = null;
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (e.currentTarget.classList.contains('list-content')) {
        e.currentTarget.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    if (e.currentTarget.classList.contains('list-content')) {
        e.currentTarget.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    if (draggedActivity) {
        const newListId = parseInt(e.currentTarget.getAttribute('data-list-id'));
        const activityId = parseInt(draggedActivity.getAttribute('data-activity-id'));

        moveActivity(activityId, newListId);
        renderBoard();
    }
}

// Activity Management
async function moveActivity(activityId, newListId) {
    try {
        // TODO: Substituir pela chamada real da API
        // await fetch(`/api/activities/${activityId}/move`, {
        //     method: 'PUT',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${token}`
        //     },
        //     body: JSON.stringify({ listId: newListId })
        // });

        // Mover localmente (manter até ter API)
        let activity = null;
        let oldList = null;

        for (let list of projectData.lists) {
            const activityIndex = list.activities.findIndex(a => a.id === activityId);
            if (activityIndex !== -1) {
                activity = list.activities[activityIndex];
                oldList = list;
                list.activities.splice(activityIndex, 1);
                break;
            }
        }

        if (activity) {
            const newList = projectData.lists.find(l => l.id === newListId);
            if (newList) {
                newList.activities.push(activity);
            }
        }
    } catch (error) {
        console.error('Erro ao mover atividade:', error);
        alert('Erro ao mover atividade. Tente novamente.');
        renderBoard(); // Reverter visualmente em caso de erro
    }
}

async function deleteActivity(activityId) {
    if (confirm('Tem certeza que deseja excluir esta atividade?')) {
        try {
            // TODO: Substituir pela chamada real da API
            // await fetch(`/api/activities/${activityId}`, {
            //     method: 'DELETE',
            //     headers: { 'Authorization': `Bearer ${token}` }
            // });

            // Remover localmente (manter até ter API)
            for (let list of projectData.lists) {
                const activityIndex = list.activities.findIndex(a => a.id === activityId);
                if (activityIndex !== -1) {
                    list.activities.splice(activityIndex, 1);
                    break;
                }
            }
            renderBoard();
        } catch (error) {
            console.error('Erro ao deletar atividade:', error);
            alert('Erro ao deletar atividade. Tente novamente.');
        }
    }
}

function findActivityById(activityId) {
    for (let list of projectData.lists) {
        const activity = list.activities.find(a => a.id === activityId);
        if (activity) {
            return { activity, list };
        }
    }
    return null;
}

function getMemberNames(memberIds) {
    return memberIds.map(id => {
        const member = projectData.members.find(m => m.id === id);
        return member ? member.name : 'Usuário não encontrado';
    }).join(', ');
}

// View Activity Modal
function viewActivity(activityId) {
    const result = findActivityById(activityId);
    if (!result) return;

    const { activity, list } = result;

    document.getElementById('viewActivityTitle').textContent = activity.title;

    // Descrição
    const descriptionEl = document.getElementById('viewActivityDescription');
    descriptionEl.textContent = activity.description || 'Sem descrição';
    descriptionEl.className = activity.description ? 'view-content' : 'view-content empty';

    // Lista
    document.getElementById('viewActivityList').textContent = list.title;

    // Membros - usar grid
    const membersEl = document.getElementById('viewActivityMembers');
    if (activity.assignedUsers.length > 0) {
        const memberChips = activity.assignedUsers.map(userId => {
            const member = projectData.members.find(m => m.id === userId);
            return member ? `
                <div class="view-member-chip">
                    <i class="fas fa-user"></i>
                    ${member.name}
                </div>
            ` : '';
        }).join('');

        membersEl.innerHTML = `<div class="view-members-grid">${memberChips}</div>`;
        membersEl.className = 'view-content';
    } else {
        membersEl.textContent = 'Nenhum membro atribuído';
        membersEl.className = 'view-content empty';
    }

    // Data
    const dateEl = document.getElementById('viewActivityDate');
    dateEl.textContent = activity.date || 'Sem data definida';
    dateEl.className = activity.date ? 'view-content' : 'view-content empty';

    // Prioridade
    const priorityEl = document.getElementById('viewActivityPriority');
    priorityEl.textContent = activity.priority ? getPriorityLabel(activity.priority) : 'Sem prioridade';
    priorityEl.className = activity.priority ? 'view-content' : 'view-content empty';

    // Status
    const statusEl = document.getElementById('viewActivityStatus');
    statusEl.textContent = activity.completed ? 'Concluída' : 'Pendente';
    statusEl.className = 'view-content';

    // Configurar botões de ação
    document.getElementById('editFromViewBtn').onclick = () => editFromView(activityId);
    document.getElementById('deleteFromViewBtn').onclick = () => deleteFromView(activityId);

    viewActivityModal.style.display = 'block';
}

function closeViewActivityModal() {
    viewActivityModal.style.display = 'none';
}

function editFromView(activityId) {
    closeViewActivityModal();
    editActivity(activityId);
}

function deleteFromView(activityId) {
    closeViewActivityModal();
    deleteActivity(activityId);
}

// Activity Modal Functions
function openActivityModal(listId = null) {
    updateMemberSelectors();
    updateListSelectors();

    document.getElementById('activityModalTitle').textContent = 'Nova Atividade';
    document.getElementById('saveActivityBtn').textContent = 'Adicionar';

    // Limpar seleções anteriores
    clearUserSelections();

    if (listId) {
        document.getElementById('activityList').value = listId;
    }
    activityModal.style.display = 'block';
}

function closeActivityModal() {
    activityModal.style.display = 'none';
    activityForm.reset();
    activityForm.removeAttribute('data-editing');
    clearUserSelections();
}

function openListModal() {
    document.getElementById('listModalTitle').textContent = 'Nova Lista';
    document.getElementById('saveListBtn').textContent = 'Criar Lista';
    listForm.removeAttribute('data-editing');
    listModal.style.display = 'block';
}

function closeListModal() {
    listModal.style.display = 'none';
    listForm.reset();
    listForm.removeAttribute('data-editing');
}

function updateListSelectors() {
    const select = document.getElementById('activityList');
    if (select) {
        select.innerHTML = '';

        projectData.lists.forEach(list => {
            const option = document.createElement('option');
            option.value = list.id;
            option.textContent = list.title;
            select.appendChild(option);
        });
    }
}

function updateMemberSelectors() {
    const container = document.getElementById('activityUsersContainer');
    if (container && projectData.members) {
        container.innerHTML = '';
        container.className = 'users-grid-container';

        projectData.members.forEach(member => {
            const userChip = document.createElement('div');
            userChip.className = 'user-chip';
            userChip.setAttribute('data-user-id', member.id);
            userChip.onclick = () => toggleUserSelection(member.id);

            userChip.innerHTML = `
                <i class="fas fa-user"></i>
                <span class="user-chip-name">${member.name}</span>
            `;

            container.appendChild(userChip);
        });
    }
}

function toggleUserSelection(userId) {
    const userChip = document.querySelector(`[data-user-id="${userId}"]`);
    if (userChip) {
        userChip.classList.toggle('selected');
    }
}

function clearUserSelections() {
    const userChips = document.querySelectorAll('.user-chip');
    userChips.forEach(chip => chip.classList.remove('selected'));
}

function getSelectedUsers() {
    const selectedChips = document.querySelectorAll('.user-chip.selected');
    return Array.from(selectedChips).map(chip => parseInt(chip.getAttribute('data-user-id')));
}

function setSelectedUsers(userIds) {
    clearUserSelections();
    userIds.forEach(userId => {
        const userChip = document.querySelector(`[data-user-id="${userId}"]`);
        if (userChip) {
            userChip.classList.add('selected');
        }
    });
}

// Form Handlers
async function handleActivitySubmit(e) {
    e.preventDefault();

    const title = document.getElementById('activityTitle').value;
    const description = document.getElementById('activityDescription').value;
    const listId = parseInt(document.getElementById('activityList').value);
    const date = document.getElementById('activityDate').value;
    const priority = document.getElementById('activityPriority').value || null;
    const assignedUsers = getSelectedUsers();

    // Formatar data se fornecida
    let formattedDate = '';
    if (date) {
        const dateObj = new Date(date);
        formattedDate = dateObj.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long'
        });
    }

    const editingId = activityForm.getAttribute('data-editing');

    try {
        if (editingId) {
            // EDITANDO ATIVIDADE EXISTENTE
            const activityData = {
                title,
                description,
                date: formattedDate,
                priority,
                assignedUsers,
                listId
            };

            // TODO: Substituir pela chamada real da API
            // await fetch(`/api/activities/${editingId}`, {
            //     method: 'PUT',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`
            //     },
            //     body: JSON.stringify(activityData)
            // });

            // Atualizar localmente (manter até ter API)
            for (let list of projectData.lists) {
                const activity = list.activities.find(a => a.id === parseInt(editingId));
                if (activity) {
                    activity.title = title;
                    activity.description = description;
                    activity.date = formattedDate;
                    activity.priority = priority;
                    activity.assignedUsers = assignedUsers;

                    // Se mudou de lista, mover a atividade
                    if (list.id !== listId) {
                        await moveActivity(activity.id, listId);
                    }
                    break;
                }
            }
        } else {
            // CRIANDO NOVA ATIVIDADE
            const newActivityData = {
                title,
                description,
                date: formattedDate,
                priority,
                assignedUsers,
                listId,
                completed: false
            };

            // TODO: Substituir pela chamada real da API que retorna o ID da nova atividade
            // const response = await fetch('/api/activities', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`
            //     },
            //     body: JSON.stringify(newActivityData)
            // });
            // const createdActivity = await response.json();

            // Criar localmente (manter até ter API)
            const newActivity = {
                id: nextActivityId++, // TODO: Substituir pelo ID retornado da API
                ...newActivityData
            };

            const targetList = projectData.lists.find(l => l.id === listId);
            if (targetList) {
                targetList.activities.push(newActivity);
            }
        }

        renderBoard();
        closeActivityModal();
    } catch (error) {
        console.error('Erro ao salvar atividade:', error);
        alert('Erro ao salvar atividade. Tente novamente.');
    }
}

async function handleListSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('listTitle').value;
    const editingId = listForm.getAttribute('data-editing');

    try {
        if (editingId) {
            // EDITANDO LISTA EXISTENTE
            // TODO: Substituir pela chamada real da API
            // await fetch(`/api/lists/${editingId}`, {
            //     method: 'PUT',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`
            //     },
            //     body: JSON.stringify({ title })
            // });

            // Atualizar localmente (manter até ter API)
            const list = projectData.lists.find(l => l.id === parseInt(editingId));
            if (list) {
                list.title = title;
            }
        } else {
            // CRIANDO NOVA LISTA
            const newListData = {
                title,
                projectId: getProjectIdFromURL()
            };

            // TODO: Substituir pela chamada real da API que retorna o ID da nova lista
            // const response = await fetch('/api/lists', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`
            //     },
            //     body: JSON.stringify(newListData)
            // });
            // const createdList = await response.json();

            // Criar localmente (manter até ter API)
            const newList = {
                id: nextListId++, // TODO: Substituir pelo ID retornado da API
                title,
                activities: []
            };

            projectData.lists.push(newList);
        }

        renderBoard();
        closeListModal();
    } catch (error) {
        console.error('Erro ao salvar lista:', error);
        alert('Erro ao salvar lista. Tente novamente.');
    }
}

// Activity interaction handlers
async function toggleActivityComplete(activityId) {
    try {
        let activity = null;

        // Encontrar a atividade
        for (let list of projectData.lists) {
            activity = list.activities.find(a => a.id === activityId);
            if (activity) break;
        }

        if (activity) {
            const newStatus = !activity.completed;

            // TODO: Substituir pela chamada real da API
            // await fetch(`/api/activities/${activityId}/toggle-complete`, {
            //     method: 'PUT',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`
            //     },
            //     body: JSON.stringify({ completed: newStatus })
            // });

            // Atualizar localmente (manter até ter API)
            activity.completed = newStatus;
            renderBoard();
        }
    } catch (error) {
        console.error('Erro ao alterar status da atividade:', error);
        alert('Erro ao alterar status. Tente novamente.');
        renderBoard(); // Reverter em caso de erro
    }
}

function editActivity(activityId) {
    updateMemberSelectors();

    const result = findActivityById(activityId);
    if (!result) return;

    const { activity, list } = result;

    document.getElementById('activityModalTitle').textContent = 'Editar Atividade';
    document.getElementById('saveActivityBtn').textContent = 'Salvar Alterações';

    document.getElementById('activityTitle').value = activity.title;
    document.getElementById('activityDescription').value = activity.description || '';
    document.getElementById('activityList').value = list.id;
    document.getElementById('activityPriority').value = activity.priority || '';

    // Marcar usuários atribuídos no grid
    setTimeout(() => {
        setSelectedUsers(activity.assignedUsers);
    }, 100);

    // Converter data de volta para formato input se existir
    if (activity.date) {
        const [day, monthName] = activity.date.split(' de ');
        const monthMap = {
            janeiro: 0, fevereiro: 1, março: 2, abril: 3,
            maio: 4, junho: 5, julho: 6, agosto: 7,
            setembro: 8, outubro: 9, novembro: 10, dezembro: 11
        };
        const date = new Date();
        date.setMonth(monthMap[monthName]);
        date.setDate(parseInt(day));
        document.getElementById('activityDate').value = date.toISOString().split('T')[0];
    }

    activityForm.setAttribute('data-editing', activityId);
    activityModal.style.display = 'block';
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long'
    });
}

function toggleMembersPopup() {
    const popup = document.getElementById('membersPopup');
    if (popup) {
        if (popup.style.display === 'block') {
            closeMembersPopup();
        } else {
            openMembersPopup();
        }
    }
}

function openMembersPopup() {
    const popup = document.getElementById('membersPopup');
    const content = document.getElementById('membersPopupContent');

    if (popup && content) {
        // Renderizar membros
        if (projectData.members && projectData.members.length > 0) {
            const membersHTML = `
                <div class="members-popup-grid">
                    ${projectData.members.map(member => `
                        <div class="popup-member-chip">
                            <i class="fas fa-user"></i>
                            <span class="popup-member-name">${member.name}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            content.innerHTML = membersHTML;
        } else {
            content.innerHTML = '<p style="color: #6c757d; font-style: italic; text-align: center;">Nenhum membro encontrado</p>';
        }

        popup.style.display = 'block';
    }
}

function closeMembersPopup() {
    const popup = document.getElementById('membersPopup');
    if (popup) {
        popup.style.display = 'none';
    }
}