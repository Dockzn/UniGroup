'use strict';

module.exports = (sequelize, DataTypes) => {

  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    team_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Teams',
        key: 'id'
      }
    }
  }, {});

  User.associate = function(models) {
    User.belongsTo(models.Team, { foreignKey: 'team_id', as: 'team' });
  };

  return User;
};
