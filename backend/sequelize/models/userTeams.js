'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserTeams = sequelize.define('UserTeams', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Teams',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.ENUM('owner', 'admin', 'member'),
      defaultValue: 'member'
    }
  }, {});

  UserTeams.associate = function(models) {
    UserTeams.belongsTo(models.User, { foreignKey: 'userId' });
    UserTeams.belongsTo(models.Team, { foreignKey: 'teamId' });
  };

  return UserTeams;
};
