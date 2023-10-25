'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserSubscriptions', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        field :"Id"
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'Id',
        },
        field : "UserId"
      },
      customerId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        field : "CustomerId"

      },
      renewDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        field : "RenewDate"

      },
      description : {
        type: Sequelize.STRING,
        allowNull: true,
        field: "Description"
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field :"CreatedAt"
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field :"UpdatedAt"

      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserSubscriptions');
  },
};
