const db = require('../../sequelize/models');

const teamController = {
    getTeamById: async (req, res) => {
        try {
            const { teamId } = req.params;
            const team = await db.Team.findByPk(teamId);
            if (!team) return res.status(404).json({ error: 'Equipe não encontrada' });
            res.json(team);
        } catch (err) {
            res.status(500).json({ error: 'Erro ao buscar equipe' });
        }
    },
    create: async (req, res) => {
        try {
            const { name, userId } = req.body;
            if (!name) return res.status(400).json({ error: 'Nome obrigatório' });
            if (!userId) return res.status(400).json({ error: 'ID do usuário obrigatório' });
            const team = await db.Team.create({ name: String(name) });
            const user = await db.User.findByPk(userId);
            if (user) {
                user.team_id = team.id;
                await user.save();
            }
            res.status(201).json(team);
        } catch (err) {
            res.status(500).json({ error: 'Erro ao criar equipe' });
        }
    },

    addMemberByEmail: async (req, res) => {
        try {
            const { teamId } = req.params;
            const { email } = req.body;
            if (!email) return res.status(400).json({ error: 'Email obrigatório' });
            const user = await db.User.findOne({ where: { email } });
            if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
            user.team_id = teamId;
            await user.save();
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: 'Erro ao adicionar membro' });
        }
    },

    getMembers: async (req, res) => {
        try {
            const { teamId } = req.params;
            const users = await db.User.findAll({ where: { team_id: teamId } });
            res.json(users);
        } catch (err) {
            res.status(500).json({ error: 'Erro ao listar membros' });
        }
    }
};
module.exports = teamController;
