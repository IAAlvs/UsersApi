'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'Email',{
      type: Sequelize.STRING,
      allowNull: false,
      unique:false
    });
    await queryInterface.removeConstraint("Users", "Users_Email_key");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'Email', {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    });
  },
};
