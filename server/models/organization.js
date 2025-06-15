const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Organization = sequelize.define("Organization", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    taxId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    registrationNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  return Organization;
};
