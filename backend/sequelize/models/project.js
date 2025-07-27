'use strict';

module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    description: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('active', 'archived'),
      defaultValue: 'active'
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dueDate: DataTypes.DATE
  });

  Project.associate = function(models) {
    Project.belongsTo(models.Team, { 
      foreignKey: 'teamId',
      as: 'team'
    });
    Project.belongsTo(models.User, { 
      foreignKey: 'ownerId',
      as: 'owner'
    });
    Project.belongsToMany(models.User, {
      through: 'UserProjects',
      as: 'members'
    });
    Project.hasMany(models.Board, {
      foreignKey: 'projectId',
      as: 'boards'
    });
  };

  return Project;
};
