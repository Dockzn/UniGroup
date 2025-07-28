'use strict';

module.exports = (sequelize, DataTypes) => {
  const List = sequelize.define('List', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  List.associate = function(models) {
    List.belongsTo(models.Project, {
      foreignKey: 'project_id',
      as: 'project'
    });
    List.hasMany(models.Activity, {
      foreignKey: 'list_id',
      as: 'activities'
    });
  };

  return List;
};
