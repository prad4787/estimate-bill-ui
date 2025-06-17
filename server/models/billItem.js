const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const BillItem = sequelize.define("BillItem", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    billId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Bills",
        key: "id",
      },
    },
    stockId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Stocks",
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  });

  return BillItem;
};
