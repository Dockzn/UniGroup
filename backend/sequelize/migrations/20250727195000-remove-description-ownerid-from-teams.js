'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Teams', 'description');
    await queryInterface.removeColumn('Teams', 'ownerId');
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Teams', 'description', {
      type: Sequelize.TEXT
    });
    await queryInterface.addColumn('Teams', 'ownerId', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};
