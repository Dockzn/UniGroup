'use strict';

module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define('Team', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    inviteCode: {
      type: DataTypes.STRING,
      unique: true
    }
  });


  Team.associate = function(models) {
    Team.hasMany(models.User, { foreignKey: 'team_id', as: 'members' });
    Team.hasMany(models.Project, {
      foreignKey: 'teamId',
      as: 'projects'
    });
  };

  return Team;
};
