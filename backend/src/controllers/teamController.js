const db = require('../../sequelize/models');
const { v4: uuidv4 } = require('uuid');

const teamController = {
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
