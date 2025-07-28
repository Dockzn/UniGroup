const { List, Activity } = require('../../sequelize/models');

// List Controller
exports.getListsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const lists = await List.findAll({ where: { project_id: projectId } });
    res.json(lists);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar listas.' });
  }
};

exports.createList = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name } = req.body;
    const list = await List.create({ name, project_id: projectId });
    res.status(201).json(list);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar lista.' });
  }
};

exports.deleteList = async (req, res) => {
  try {
    const { listId } = req.params;
    await List.destroy({ where: { id: listId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir lista.' });
  }
};

// Activity Controller
exports.getActivitiesByList = async (req, res) => {
  try {
    const { listId } = req.params;
    const activities = await Activity.findAll({ where: { list_id: listId } });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar atividades.' });
  }
};

exports.createActivity = async (req, res) => {
  try {
    const { listId } = req.params;
    const { title, description, date, priority, completed } = req.body;
    let isoDate = null;
    if (date) {
      // Tenta converter para formato ISO se não estiver
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        isoDate = d.toISOString();
      } else {
        isoDate = null;
      }
    }
    const activity = await Activity.create({
      title,
      description,
      date: isoDate,
      priority,
      completed: completed === undefined ? false : completed,
      list_id: listId
    });
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar atividade.' });
  }
};

exports.updateActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { completed, list_id } = req.body;
    const activity = await Activity.findByPk(activityId);
    if (!activity) return res.status(404).json({ error: 'Atividade não encontrada.' });
    if (typeof completed !== 'undefined') activity.completed = completed;
    if (typeof list_id !== 'undefined') activity.list_id = list_id;
    await activity.save();
    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar atividade.' });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    await Activity.destroy({ where: { id: activityId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir atividade.' });
  }
};

exports.updateList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { name } = req.body;

    const list = await List.findByPk(listId);
    if (!list) {
      return res.status(404).json({ error: 'Lista não encontrada.' });
    }

    list.name = name;
    await list.save();

    res.json(list);
  } catch (err) {
    console.error('Erro ao atualizar lista:', err);
    res.status(500).json({ error: 'Erro ao atualizar a lista.' });
  }
};