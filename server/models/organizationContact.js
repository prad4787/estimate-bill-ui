const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const OrganizationContact = sequelize.define("OrganizationContact", {
    type: {
      type: DataTypes.ENUM("phone", "email"),
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return OrganizationContact;
};
