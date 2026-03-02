"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Feedback extends Model {
    static associate(models) {
      Feedback.belongsTo(models.Contact, {
        foreignKey: "contactId",
        as: "contact",
      });
      Feedback.belongsTo(models.Message, {
        foreignKey: "messageId",
        as: "message",
      });
    }
  }

  Feedback.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      contactId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      messageId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      whatsappMessageId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contactName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sentiment: {
        type: DataTypes.ENUM("positive", "negative", "neutral"),
        allowNull: false,
        defaultValue: "neutral",
      },
      respondedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Feedback",
    },
  );

  return Feedback;
};
