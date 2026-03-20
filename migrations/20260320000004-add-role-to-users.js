"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.addColumn("Users", "roleId", {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Roles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("Users", "name", {
      type: DataTypes.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "isActive", {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.removeColumn("Users", "roleId");
    await queryInterface.removeColumn("Users", "name");
    await queryInterface.removeColumn("Users", "isActive");
  },
};
