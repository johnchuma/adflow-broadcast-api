"use strict";

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Invitation extends Model {
    static associate(models) {
      Invitation.belongsTo(models.Contact, {
        foreignKey: "contactId",
        as: "contact",
      });
      Invitation.belongsTo(models.Message, {
        foreignKey: "messageId",
        as: "message",
      });
      Invitation.belongsTo(models.Feedback, {
        foreignKey: "feedbackId",
        as: "feedback",
      });
    }
  }

  Invitation.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      contactId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      messageId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      feedbackId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contactName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
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
    },
    {
      sequelize,
      modelName: "Invitation",
    },
  );

  return Invitation;
};
