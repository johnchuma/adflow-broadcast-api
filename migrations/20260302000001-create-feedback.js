"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("Feedbacks", {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      // FK → Contacts (nullable: contact may not be in our DB)
      contactId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "Contacts", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      // FK → Messages (nullable: we link to the broadcast if we can identify it)
      messageId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "Messages", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      // Raw WhatsApp message id (wamid)
      whatsappMessageId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      // Phone number the reply came from (always stored for deduplication)
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // Display name from the WhatsApp profile
      contactName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // The verbatim button/text the contact replied with
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // "positive" | "negative" | "neutral"
      sentiment: {
        type: DataTypes.ENUM("positive", "negative", "neutral"),
        allowNull: false,
        defaultValue: "neutral",
      },
      // Unix timestamp from WhatsApp (stored as-is for precise ordering)
      respondedAt: {
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
    await queryInterface.dropTable("Feedbacks");
  },
};
