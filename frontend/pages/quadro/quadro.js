const IS_LOCAL = false;
const API_URL = IS_LOCAL ? 'http://localhost:3000' : 'https://unigroup.onrender.com';

let projectData = {};
let draggedActivity = null;
let draggedList = null;
let nextActivityId = 12;
let nextListId = 5;

const board = document.getElementById('board');
const activityModal = document.getElementById('activityModal');
const viewActivityModal = document.getElementById('viewActivityModal');
const listModal = document.getElementById('listModal');
const activityForm = document.getElementById('activityForm');
const listForm = document.getElementById('listForm');

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
        // Carregar nome do projeto
        const projectRes = await fetch(`${API_URL}/api/projects/${projectId}`);
        if (projectRes.ok) {
            const project = await projectRes.json();
            projectData.name = project.name;
        }

        // Carregar membros da equipe do projeto
        try {
            const teamRes = await fetch(`${API_URL}/api/projects/${projectId}/team`);
            if (teamRes.ok) {
                const team = await teamRes.json();
                if (team.id) {
                    const membersRes = await fetch(`${API_URL}/api/teams/${team.id}/members`);
                    if (membersRes.ok) {
                        const members = await membersRes.json();
                        projectData.members = members.map(member => ({
                            id: member.id,
                            name: member.name,
                            email: member.email
                        }));
                    }
                }
            }
        } catch (e) {
            console.log('Erro ao carregar membros:', e);
        }

        // Carregar listas e atividades
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
        console.error('Erro ao carregar dados do projeto:', error);
        projectData.lists = [];
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    const projectId = getProjectIdFromURL();
    if (projectId) {
        await loadProjectData(projectId);
    }
    renderBoard();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('closeModal').addEventListener('click', closeActivityModal);
    document.getElementById('closeViewModal').addEventListener('click', closeViewActivityModal);
    document.getElementById('closeListModal').addEventListener('click', closeListModal);
    document.getElementById('cancelBtn').addEventListener('click', closeActivityModal);
    document.getElementById('cancelListBtn').addEventListener('click', closeListModal);

    const btnMembers = document.getElementById('btnMembers');
    if (btnMembers) {
        btnMembers.addEventListener('click', toggleMembersPopup);
    }

    const closeMembersBtn = document.getElementById('closeMembersPopup');
    if (closeMembersBtn) {
        closeMembersBtn.addEventListener('click', closeMembersPopup);
    }

    // Botão adicionar membro (novo)
    const btnAddMember = document.getElementById('btnAddMember');
    if (btnAddMember) {
        btnAddMember.addEventListener('click', openAddMemberModal);
    }

    const btnCreateList = document.querySelector('.btn-create-list');
    if (btnCreateList) {
        btnCreateList.addEventListener('click', function () {
            document.getElementById('listTitle').value = '';
            openListModal();
        });
    }

    // Dentro da função setupEventListeners em quadro.js
    const favButton = document.querySelector('.btn-favorite');
    if (favButton) {
        const projectId = getProjectIdFromURL();
        const currentUser = JSON.parse(localStorage.getItem('user'));

        // Define o estado inicial do botão
        const favorites = JSON.parse(localStorage.getItem(`favorites_${currentUser.id}`) || '[]');
        if (favorites.includes(Number(projectId))) {
            favButton.classList.add('active');
        }

        // Adiciona o evento de clique
        favButton.addEventListener('click', () => {
            let favorites = JSON.parse(localStorage.getItem(`favorites_${currentUser.id}`) || '[]');
            const projectIdNum = Number(projectId);
            const index = favorites.indexOf(projectIdNum);

            if (index > -1) {
                favorites.splice(index, 1);
                favButton.classList.remove('active');
            } else {
                favorites.push(projectIdNum);
                favButton.classList.add('active');
            }
            localStorage.setItem(`favorites_${currentUser.id}`, JSON.stringify(favorites));
        });
    }

    activityForm.addEventListener('submit', handleActivitySubmit);
    listForm.addEventListener('submit', handleListSubmit);

    document.getElementById('editFromViewBtn').addEventListener('click', editFromView);
    document.getElementById('deleteFromViewBtn').addEventListener('click', deleteFromView);

    document.addEventListener('click', function (e) {
        const popup = document.getElementById('membersPopup');
        const btn = document.getElementById('btnMembers');
        if (popup && btn && !popup.contains(e.target) && !btn.contains(e.target)) {
            closeMembersPopup();
        }
    });

    window.addEventListener('click', function (e) {
        if (e.target === activityModal) closeActivityModal();
        if (e.target === viewActivityModal) closeViewActivityModal();
        if (e.target === listModal) closeListModal();
    });
}

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

    // Buscar nomes dos membros atribuídos
    const assignedMembersHTML = activity.assignedUsers && activity.assignedUsers.length > 0 ? `
        <div class="activity-members">
            ${activity.assignedUsers.map(userId => {
        const member = projectData.members.find(m => m.id === userId);
        return member ? `<div class="activity-member-chip"><i class="fas fa-user"></i>${member.name}</div>` : '';
    }).join('')}
        </div>
    ` : '';

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
            ${assignedMembersHTML}
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
            // A chamada para a API agora funcionará por causa das mudanças no backend
            const response = await fetch(`${API_URL}/api/lists/${listId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newTitle.trim() })
            });

            if (!response.ok) {
                // Lança um erro se a resposta do servidor não for OK
                throw new Error('Falha na resposta do servidor');
            }

            // Atualiza o estado localmente após o sucesso
            const list = projectData.lists.find(l => l.id === listId);
            if (list) {
                list.title = newTitle.trim();
                listElement.value = newTitle.trim();
            }

        } catch (error) {
            console.error('Erro ao renomear lista:', error);
            alert('Erro ao renomear lista. Tente novamente.');
            // Reverte para o nome original em caso de erro
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
            const [draggedList] = projectData.lists.splice(draggedIndex, 1);
            projectData.lists.splice(targetIndex, 0, draggedList);
        }
    } catch (error) {
        console.error('Erro ao reordenar listas:', error);
        alert('Erro ao reordenar listas. Tente novamente.');
        renderBoard();
    }
}

function setupListDropZone(container) {
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);
    container.addEventListener('dragleave', handleDragLeave);
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

async function moveActivity(activityId, newListId) {
    try {
        const { boardService } = await import('../../services/boardService.js');
        await boardService.updateActivity(activityId, { list_id: newListId });

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
        renderBoard();
    }
}

async function deleteActivity(activityId) {
    if (confirm('Tem certeza que deseja excluir esta atividade?')) {
        try {
            const { boardService } = await import('../../services/boardService.js');
            await boardService.deleteActivity(activityId);

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

function viewActivity(activityId) {
    const result = findActivityById(activityId);
    if (!result) return;

    const { activity, list } = result;

    document.getElementById('viewActivityTitle').textContent = activity.title;

    const descriptionEl = document.getElementById('viewActivityDescription');
    descriptionEl.textContent = activity.description || 'Sem descrição';
    descriptionEl.className = activity.description ? 'view-content' : 'view-content empty';

    document.getElementById('viewActivityList').textContent = list.title;

    const membersEl = document.getElementById('viewActivityMembers');
    if (activity.assignedUsers && activity.assignedUsers.length > 0) {
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

    const dateEl = document.getElementById('viewActivityDate');
    dateEl.textContent = activity.date || 'Sem data definida';
    dateEl.className = activity.date ? 'view-content' : 'view-content empty';

    const priorityEl = document.getElementById('viewActivityPriority');
    priorityEl.textContent = activity.priority ? getPriorityLabel(activity.priority) : 'Sem prioridade';
    priorityEl.className = activity.priority ? 'view-content' : 'view-content empty';

    const statusEl = document.getElementById('viewActivityStatus');
    statusEl.textContent = activity.completed ? 'Concluída' : 'Pendente';
    statusEl.className = 'view-content';

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

function openActivityModal(listId = null) {
    updateMemberSelectors();
    updateListSelectors();

    document.getElementById('activityModalTitle').textContent = 'Nova Atividade';
    document.getElementById('saveActivityBtn').textContent = 'Adicionar';

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

async function handleActivitySubmit(e) {
    e.preventDefault();

    const title = document.getElementById('activityTitle').value;
    const description = document.getElementById('activityDescription').value;
    const listId = parseInt(document.getElementById('activityList').value);
    const date = document.getElementById('activityDate').value;
    const priority = document.getElementById('activityPriority').value || null;
    const assignedUsers = getSelectedUsers();

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
            const activityData = {
                title,
                description,
                date: formattedDate,
                priority,
                assignedUsers,
                listId
            };

            for (let list of projectData.lists) {
                const activity = list.activities.find(a => a.id === parseInt(editingId));
                if (activity) {
                    activity.title = title;
                    activity.description = description;
                    activity.date = formattedDate;
                    activity.priority = priority;
                    activity.assignedUsers = assignedUsers;

                    if (list.id !== listId) {
                        await moveActivity(activity.id, listId);
                    }
                    break;
                }
            }
        } else {
            const { boardService } = await import('../../services/boardService.js');
            const newActivityData = {
                title,
                description,
                date: formattedDate,
                priority,
                completed: false
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
                    assignedUsers: assignedUsers
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
        }
        closeListModal();
        await loadProjectData(projectId);
        renderBoard();
    } catch (error) {
        console.error('Erro ao salvar lista:', error);
        alert('Erro ao salvar lista. Tente novamente.');
    }
}

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
        renderBoard();
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
        setSelectedUsers(activity.assignedUsers || []);
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

// Modal para adicionar membro
function openAddMemberModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h3>Adicionar Membro à Equipe</h3>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="memberEmail">E-mail do usuário:</label>
                    <input type="email" id="memberEmail" placeholder="Digite o e-mail" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div style="margin-top: 15px; text-align: right;">
                    <button onclick="this.closest('.modal').remove()" style="margin-right: 10px; padding: 8px 16px; background: #f4f5f7; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
                    <button onclick="addMemberToTeam()" style="padding: 8px 16px; background: #026aa7; color: white; border: none; border-radius: 4px; cursor: pointer;">Adicionar</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function addMemberToTeam() {
    const email = document.getElementById('memberEmail').value.trim();
    if (!email) {
        alert('Digite o e-mail do usuário');
        return;
    }

    try {
        const projectId = getProjectIdFromURL();
        const teamRes = await fetch(`${API_URL}/api/projects/${projectId}/team`);

        if (!teamRes.ok) {
            throw new Error('Erro ao buscar equipe do projeto');
        }

        const team = await teamRes.json();
        if (!team.id) {
            alert('Projeto sem equipe associada');
            return;
        }

        const res = await fetch(`${API_URL}/api/teams/${team.id}/add-member`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || data.error) {
            alert(data.error || 'Erro ao adicionar membro');
            return;
        }

        alert('Membro adicionado com sucesso!');
        document.querySelector('.modal').remove();

        // Recarregar dados do projeto para atualizar lista de membros
        await loadProjectData(projectId);
        renderBoard();
    } catch (error) {
        console.error('Erro ao adicionar membro:', error);
        alert('Erro ao adicionar membro. Tente novamente.');
    }
}