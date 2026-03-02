"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("Invitations", {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      contactId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "Contacts", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      messageId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "Messages", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      feedbackId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "Feedbacks", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contactName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Filename of the generated QR code PNG stored in the /files directory
      qrCodeFile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      checkedIn: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      checkedInAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Invitations");
  },
};
