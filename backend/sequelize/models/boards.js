'use strict';

module.exports = (sequelize, DataTypes) => {
  const Board = sequelize.define('Board', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  Board.associate = function(models) {
    Board.belongsTo(models.Project, {
      foreignKey: 'projectId',
      as: 'project'
    });
  };

  return Board;
};
