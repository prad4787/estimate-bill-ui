const { DataTypes } = require("sequelize");
const { ClientModel } = require(".");

module.exports = (sequelize) => {
  const EstimateModel = sequelize.define(
    "Estimate",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      clientId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: ClientModel,
          key: "id",
        },
      },
      items: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      subTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      discountType: {
        type: DataTypes.ENUM("rate", "amount"),
        allowNull: false,
        defaultValue: "rate",
      },
      discountValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      discountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "estimates",
      timestamps: true,
    }
  );

  return EstimateModel;
};
