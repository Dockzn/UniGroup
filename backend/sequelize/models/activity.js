'use strict';

module.exports = (sequelize, DataTypes) => {
  const Activity = sequelize.define('Activity', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    priority: {
      type: DataTypes.ENUM('baixa', 'media', 'alta'),
      allowNull: false,
      defaultValue: 'media'
    },
    list_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    assigned_user_ids: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  Activity.associate = function(models) {
    Activity.belongsTo(models.List, {
      foreignKey: 'list_id',
      as: 'list'
    });
  };

  return Activity;
};
