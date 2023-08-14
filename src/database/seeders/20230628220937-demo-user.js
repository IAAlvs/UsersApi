'use strict';
const crypto = require("crypto")

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      Id : '61ad624c-7233-4839-8ece-49fe0e3041ce',
      AuthId : crypto.randomUUID(),
      Email : "emailtests@gmail.com",
      EmailVerified : false,
      Picture : null,
      Name: 'John',
      LastName: 'Doe',
      SecondLastName: 'Doe2',
      Age : 50, 
      Address : "Address example",
      CreatedAt: new Date(),
      UpdatedAt: new Date()
    }]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};