"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Contacts", "name", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("Contacts", "location", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Contacts", "name", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("Contacts", "location", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
