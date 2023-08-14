'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserFiles', {
      userId: {
        type: Sequelize.UUID,
        autoIncrement: false,
        allowNull: false,
        primaryKey: true,
        field : "UserId",
        references: {
          model: 'Users',
          key: 'Id'
        }
      },
      fileId: {
        type: Sequelize.UUID,
        autoIncrement: false,
        allowNull: false,
        primaryKey: true,
        field : "FileId"
      },
      fileName: {
        type: Sequelize.STRING,
        autoIncrement: false,
        allowNull: false,
        field : "FileName"
      },
      fileSize: {
        type: Sequelize.INTEGER,
        autoIncrement: false,
        allowNull: false,
        field : "FileSize"
      },
      fileType: {
        type: Sequelize.STRING,
        autoIncrement: false,
        allowNull: false,
        field : "FileType"
      },
      dropDate : {
        type : Sequelize.DATEONLY,
        field : "DropDate",
        autoIncrement : false,
        allowNull : false,
      },
      visible: {
        type: Sequelize.BOOLEAN,
        field : "Visible",
        allowNull: true,
        defaultValue: true
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
      }
    });
    await queryInterface.addConstraint('UserFiles', {
      fields: ['UserId'],
      type: 'foreign key',
      name: 'fk_userfiles_user',
      references: {
        table: 'Users',
        field: 'Id'
      },
      //NOT DELETE FOR OUR CASE
      //onDelete : 'CASCADE'
      onUpdate : 'CASCADE'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserFiles');
  }
};