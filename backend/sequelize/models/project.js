
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  Project.associate = function(models) {
    Project.belongsTo(models.Team, {
      foreignKey: 'teamId',
      as: 'team'
    });
    Project.hasMany(models.List, {
      foreignKey: 'project_id',
      as: 'lists'
    });
  };

  return Project;
};
