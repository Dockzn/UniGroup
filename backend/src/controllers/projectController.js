const db = require('../../sequelize/models');

const projectController = {
    create: async (req, res) => {
        try {
            const { name, description, teamId, dueDate } = req.body;
            const userId = req.user.id;

            const team = await db.Team.findOne({
                include: [{
                    model: db.User,
                    as: 'members',
                    where: { id: userId }
                }],
                where: { id: teamId }
            });

            if (!team) {
                return res.status(403).json({
                    message: 'Você não tem permissão para criar projetos nesta equipe'
                });
            }

            const project = await db.Project.create({
                name,
                description,
                teamId,
                ownerId: userId,
                dueDate
            });

            await db.UserProjects.create({
                userId,
                projectId: project.id,
                role: 'owner'
            });

            res.status(201).json({
                message: 'Projeto criado com sucesso',
                project
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erro ao criar projeto',
                error: error.message
            });
        }
    },

    list: async (req, res) => {
        try {
            const { teamId } = req.params;
            const userId = req.user.id;

            const projects = await db.Project.findAll({
                where: { teamId },
                include: [
                    {
                        model: db.User,
                        as: 'members',
                        through: { attributes: ['role', 'favorite'] }
                    },
                    {
                        model: db.User,
                        as: 'owner',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });

            res.json(projects);
        } catch (error) {
            res.status(500).json({
                message: 'Erro ao listar projetos',
                error: error.message
            });
        }
    },

    toggleFavorite: async (req, res) => {
        try {
            const { projectId } = req.params;
            const userId = req.user.id;

            const userProject = await db.UserProjects.findOne({
                where: {
                    userId,
                    projectId
                }
            });

            if (!userProject) {
                return res.status(404).json({
                    message: 'Projeto não encontrado'
                });
            }

            userProject.favorite = !userProject.favorite;
            await userProject.save();

            res.json({
                message: userProject.favorite ? 'Projeto favoritado' : 'Projeto desfavoritado',
                favorite: userProject.favorite
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erro ao atualizar favorito',
                error: error.message
            });
        }
    },

    archive: async (req, res) => {
        try {
            const { projectId } = req.params;
            const userId = req.user.id;

            const project = await db.Project.findOne({
                where: { id: projectId },
                include: [{
                    model: db.User,
                    as: 'members',
                    through: { attributes: ['role'] },
                    where: { id: userId }
                }]
            });

            if (!project) {
                return res.status(404).json({
                    message: 'Projeto não encontrado'
                });
            }

            const userRole = project.members[0].UserProjects.role;
            if (userRole !== 'owner' && userRole !== 'admin') {
                return res.status(403).json({
                    message: 'Você não tem permissão para arquivar este projeto'
                });
            }

            project.status = project.status === 'active' ? 'archived' : 'active';
            await project.save();

            res.json({
                message: `Projeto ${project.status === 'active' ? 'ativado' : 'arquivado'} com sucesso`,
                status: project.status
            });
        } catch (error) {
            res.status(500).json({
                message: 'Erro ao arquivar projeto',
                error: error.message
            });
        }
    }
};

module.exports = projectController;
