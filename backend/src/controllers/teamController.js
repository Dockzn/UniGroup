const db = require('../../sequelize/models');
const { v4: uuidv4 } = require('uuid');

const teamController = {
    addMemberByEmail: async (req, res) => {
        try {
            const { teamId } = req.params;
            const { email } = req.body;
            const requesterId = req.user.id;

            // Verificar se o email foi fornecido
            if (!email) {
                return res.status(400).json({ message: 'Email é obrigatório' });
            }

            // Verificar se o usuário existe
            const userToAdd = await db.User.findOne({ where: { email } });
            if (!userToAdd) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            // Verificar se a equipe existe e se o solicitante tem permissão
            const team = await db.Team.findOne({
                include: [{
                    model: db.User,
                    as: 'members',
                    through: { attributes: ['role'] },
                    where: { id: requesterId }
                }],
                where: { id: teamId }
            });

            if (!team) {
                return res.status(404).json({ message: 'Equipe não encontrada' });
            }

            // Verificar se o solicitante tem permissão (owner ou admin)
            const requesterRole = team.members[0].UserTeams.role;
            if (requesterRole !== 'owner' && requesterRole !== 'admin') {
                return res.status(403).json({ message: 'Sem permissão para adicionar membros' });
            }

            // Verificar se o usuário já está em alguma equipe
            const alreadyInTeam = await db.UserTeams.findOne({
                where: {
                    userId: userToAdd.id
                }
            });
            if (alreadyInTeam) {
                return res.status(400).json({ message: 'Usuário já está vinculado a uma equipe' });
            }

            // Verificar se o usuário já é membro da equipe (por segurança)
            const existingMember = await db.UserTeams.findOne({
                where: {
                    teamId,
                    userId: userToAdd.id
                }
            });
            if (existingMember) {
                return res.status(400).json({ message: 'Usuário já é membro da equipe' });
            }

            // Adicionar o usuário à equipe
            await db.UserTeams.create({
                teamId,
                userId: userToAdd.id,
                role: 'member'
            });

            // Retornar os dados do membro adicionado
            res.json({
                success: true,
                member: {
                    id: userToAdd.id,
                    name: userToAdd.name,
                    email: userToAdd.email,
                    role: 'member'
                }
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erro ao adicionar membro',
                error: error.message
            });
        }
    },

    removeMember: async (req, res) => {
        try {
            const { teamId, userId } = req.params;
            const requesterId = req.user.id;

            const team = await db.Team.findOne({
                include: [{
                    model: db.User,
                    as: 'members',
                    through: { attributes: ['role'] },
                    where: { id: requesterId }
                }],
                where: { id: teamId }
            });

            if (!team) {
                return res.status(404).json({ message: 'Equipe não encontrada' });
            }

            const requesterRole = team.members[0].UserTeams.role;
            if (requesterRole !== 'owner' && requesterRole !== 'admin' && requesterId !== userId) {
                return res.status(403).json({ message: 'Sem permissão para remover membros' });
            }

            await db.UserTeams.destroy({
                where: {
                    teamId,
                    userId
                }
            });

            res.json({ message: 'Membro removido com sucesso' });
        } catch (error) {
            res.status(500).json({
                message: 'Erro ao remover membro',
                error: error.message
            });
        }
    },

    leaveTeam: async (req, res) => {
        try {
            const { teamId } = req.params;
            const userId = req.user.id;

            const team = await db.Team.findOne({
                where: { id: teamId }
            });

            if (!team) {
                return res.status(404).json({ message: 'Equipe não encontrada' });
            }

            if (team.ownerId === userId) {
                return res.status(400).json({ message: 'O proprietário não pode sair da equipe' });
            }

            await db.UserTeams.destroy({
                where: {
                    teamId,
                    userId
                }
            });

            res.json({ message: 'Você saiu da equipe com sucesso' });
        } catch (error) {
            res.status(500).json({
                message: 'Erro ao sair da equipe',
                error: error.message
            });
        }
    },

    getTeam: async (req, res) => {
        try {
            const { teamId } = req.params;
            const userId = req.user.id;

            const team = await db.Team.findOne({
                where: { id: teamId },
                include: [{
                    model: db.User,
                    as: 'members',
                    through: { attributes: ['role'] },
                    where: { id: userId }
                }]
            });

            if (!team) {
                return res.status(404).json({ message: 'Equipe não encontrada' });
            }

            res.json(team);
        } catch (error) {
            res.status(500).json({
                message: 'Erro ao obter detalhes da equipe',
                error: error.message
            });
        }
    },

    getMembers: async (req, res) => {
        try {
            const { teamId } = req.params;
            const userId = req.user.id;

            const team = await db.Team.findOne({
                include: [{
                    model: db.User,
                    as: 'members',
                    attributes: ['id', 'name', 'email'],
                    through: { attributes: ['role'] }
                }],
                where: { id: teamId }
            });

            if (!team) {
                return res.status(404).json({ message: 'Equipe não encontrada' });
            }

            res.json(team.members);
        } catch (error) {
            res.status(500).json({
                message: 'Erro ao listar membros',
                error: error.message
            });
        }
    },

    create: async (req, res) => {
        try {
            const { name, description } = req.body;
            const userId = req.user.id;

            const team = await db.Team.create({
                name,
                description,
                ownerId: userId,
                inviteCode: uuidv4()
            });

            await db.UserTeams.create({
                userId,
                teamId: team.id,
                role: 'owner'
            });

            res.status(201).json({
                message: 'Equipe criada com sucesso',
                team
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erro ao criar equipe',
                error: error.message
            });
        }
    },

    list: async (req, res) => {
        try {
            const userId = req.user.id;
            const teams = await db.Team.findAll({
                include: [{
                    model: db.User,
                    as: 'members',
                    through: { attributes: ['role'] }
                }],
                where: {
                    '$members.id$': userId
                }
            });

            res.json(teams);
        } catch (error) {
            res.status(500).json({
                message: 'Erro ao listar equipes',
                error: error.message
            });
        }
    },

    join: async (req, res) => {
        try {
            const { inviteCode } = req.params;
            const userId = req.user.id;

            const team = await db.Team.findOne({
                where: { inviteCode }
            });

            if (!team) {
                return res.status(404).json({
                    message: 'Código de convite inválido'
                });
            }

            const [userTeam, created] = await db.UserTeams.findOrCreate({
                where: {
                    userId,
                    teamId: team.id
                },
                defaults: {
                    role: 'member'
                }
            });

            if (!created) {
                return res.status(400).json({
                    message: 'Você já é membro desta equipe'
                });
            }

            res.status(201).json({
                message: 'Você entrou na equipe com sucesso',
                team
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erro ao entrar na equipe',
                error: error.message
            });
        }
    }
};

module.exports = teamController;
