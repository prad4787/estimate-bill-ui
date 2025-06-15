const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Stock = sequelize.define("Stock", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("tracked", "untracked"),
      allowNull: false,
      defaultValue: "untracked",
      get() {
        // If quantity is null, status should be untracked
        const quantity = this.getDataValue("quantity");
        if (quantity === null) return "untracked";
        return this.getDataValue("status");
      },
    },
  });
  return Stock;
};
