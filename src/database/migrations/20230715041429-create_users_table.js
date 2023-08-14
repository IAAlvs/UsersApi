'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        field: "Id"
      },
      authId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        field: 'AuthId',
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        field: 'Email'
      },
      emailVerified :{
        type : Sequelize.BOOLEAN,
        unique : false,
        allowNull : false,
        field : "EmailVerified"
      },
      picture : {
        type : Sequelize.STRING,
        unique : false,
        allowNull : true,
        field : "Picture"
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'Name',
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'LastName',
      },
      secondLastName: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'SecondLastName',
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'Age',
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'Address',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'CreatedAt',
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'UpdatedAt',
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};
