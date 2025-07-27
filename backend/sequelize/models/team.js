'use strict';

module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define('Team', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    description: DataTypes.TEXT,
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    inviteCode: {
      type: DataTypes.STRING,
      unique: true
    }
  });

  Team.associate = function(models) {
    Team.belongsTo(models.User, { as: 'owner', foreignKey: 'ownerId' });
    Team.belongsToMany(models.User, { 
      through: 'UserTeams',
      as: 'members'
    });
    Team.hasMany(models.Project, {
      foreignKey: 'teamId',
      as: 'projects'
    });
  };

  return Team;
};
