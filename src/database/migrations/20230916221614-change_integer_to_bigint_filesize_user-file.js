'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('UserFiles', 'FileSize', {
      type: Sequelize.BIGINT,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('UserFiles', 'FileSize', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
