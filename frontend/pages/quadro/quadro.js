
const IS_LOCAL = false;
const API_URL = IS_LOCAL ? 'http://localhost:3000' : 'https://unigroup.onrender.com';
// Mock data
let projectData = {};

function getProjectIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('projectId');
}

async function loadProjectData(projectId) {
    projectData = {
        name: "Projeto",
        members: [],
        lists: []
    };
    try {
        const { boardService } = await import('../../services/boardService.js');
        const lists = await boardService.getListsByProject(projectId);
        const listsWithActivities = await Promise.all(lists.map(async (list) => {
            const activities = await boardService.getActivitiesByList(list.id);
            return {
                id: list.id,
                title: list.name,
                activities: activities.map(activity => ({
                    id: activity.id,
                    title: activity.title,
                    description: activity.description,
                    date: activity.date,
                    priority: activity.priority,
                    assignedUsers: activity.assigned_user_ids || [],
                    completed: activity.completed
                }))
            };
        }));
        projectData.lists = listsWithActivities;
    } catch (error) {
        console.error('Erro ao carregar listas/atividades:', error);
        projectData.lists = [];
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

// Área de debug simples
let debugArea = document.getElementById('debugArea');
if (!debugArea) {
    debugArea = document.createElement('div');
    debugArea.id = 'debugArea';
    debugArea.style = 'background:#f8f9fa;border:1px solid #ccc;padding:8px;margin:8px 0;font-size:13px;color:#333;';
    document.body.insertBefore(debugArea, document.body.firstChild);
}
function printDebug(msg) {
    debugArea.innerHTML += `<div>${msg}</div>`;
}

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
        btnCreateList.addEventListener('click', function() {
            document.getElementById('listTitle').value = '';
            openListModal();
        });
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

    if (projectData.lists && projectData.lists.length > 0) {
        projectData.lists.forEach(list => {
            const listElement = createListElement(list);
            board.appendChild(listElement);
        });
    } else {
        board.innerHTML = '<div style="color:#888;padding:40px;text-align:center;width:100%;">Nenhuma lista encontrada para este projeto.<br>Crie uma nova lista para começar.</div>';
    }

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
        // Integração com backend
        const { boardService } = await import('../../services/boardService.js');
        await boardService.updateActivity(activityId, { list_id: newListId });

        // Mover localmente
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
            // Integração com backend
            const { boardService } = await import('../../services/boardService.js');
            await boardService.deleteActivity(activityId);

            // Remover localmente
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
            // CRIANDO NOVA ATIVIDADE via API
            const { boardService } = await import('../../services/boardService.js');
            const newActivityData = {
                title,
                description,
                date: formattedDate,
                priority,
                completed: false
                // assignedUsers pode ser ignorado se não existir no backend
            };
            const createdActivity = await boardService.createActivity(listId, newActivityData);
            const targetList = projectData.lists.find(l => l.id === listId);
            if (targetList && createdActivity) {
                targetList.activities.push({
                    id: createdActivity.id,
                    title: createdActivity.title,
                    description: createdActivity.description,
                    date: createdActivity.date,
                    priority: createdActivity.priority,
                    completed: createdActivity.completed || false,
                    assignedUsers: createdActivity.assigned_user_ids || []
                });
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

    const title = document.getElementById('listTitle').value.trim();
    const editingId = listForm.getAttribute('data-editing');
    try {
        if (!title) {
            alert('Digite o nome da lista.');
            return;
        }
        const { boardService } = await import('../../services/boardService.js');
        const projectId = getProjectIdFromURL();
        if (!editingId) {
            await boardService.createList(projectId, title);
        } else {
            // Edição de lista (não implementado no backend)
        }
        closeListModal();
        await loadProjectData(projectId);
        renderBoard();
    } catch (error) {
        console.error('Erro ao salvar lista:', error);
        alert('Erro ao salvar lista. Tente novamente.');
    }
}

// Activity interaction handlers
async function toggleActivityComplete(activityId) {
    try {
        let activity = null;
        for (let list of projectData.lists) {
            activity = list.activities.find(a => a.id === activityId);
            if (activity) break;
        }
        if (activity) {
            const newStatus = !activity.completed;
            const { boardService } = await import('../../services/boardService.js');
            await boardService.updateActivity(activityId, { completed: newStatus });
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

    setTimeout(() => {
        setSelectedUsers(activity.assignedUsers);
    }, 100);

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
            const content = document.getElementById('membersPopupContent');
            if (content) {
                // Buscar membros da equipe do projeto no backend
                (async () => {
                    try {
                        // Descobrir o teamId do projeto usando o novo endpoint
                        const projectId = getProjectIdFromURL();
                        const resTeam = await fetch(`${API_URL}/api/projects/${projectId}/team`);
                        if (!resTeam.ok) {
                            content.innerHTML = '<p style="color: #dc3545; font-style: italic; text-align: center;">Erro ao buscar equipe do projeto</p>';
                            openMembersPopup();
                            return;
                        }
                        const team = await resTeam.json();
                        const teamId = team.id;
                        if (!teamId) {
                            content.innerHTML = '<p style="color: #6c757d; font-style: italic; text-align: center;">Projeto sem equipe associada</p>';
                            openMembersPopup();
                            return;
                        }
                        // Buscar membros da equipe
                        const resMembros = await fetch(`${API_URL}/api/teams/${teamId}/members`);
                        let membros = [];
                        if (resMembros.ok) {
                            membros = await resMembros.json();
                        }
                        // Exibir membros no modal
                        if (membros.length > 0) {
                            content.innerHTML = `
                                <div class="members-popup-grid">
                                    ${membros.map(membro => `
                                        <div class="popup-member-chip">
                                            <i class="fas fa-user"></i>
                                            <span class="popup-member-name">${membro.name}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            `;
                        } else {
                            content.innerHTML = '<p style="color: #6c757d; font-style: italic; text-align: center;">Nenhum membro encontrado</p>';
                        }
                    } catch (err) {
                        content.innerHTML = '<p style="color: #dc3545; font-style: italic; text-align: center;">Erro ao buscar membros</p>';
                    }
                    openMembersPopup();
                })();
            }
        }
    }
}

function openMembersPopup() {
    const popup = document.getElementById('membersPopup');
    const content = document.getElementById('membersPopupContent');

    if (popup && content) {
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