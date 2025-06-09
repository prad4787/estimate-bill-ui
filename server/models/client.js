const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Client = sequelize.define("Client", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    panVat: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "pan_vat",
    },
    openingBalance: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
      field: "opening_balance",
    },
  });
  return Client;
};
