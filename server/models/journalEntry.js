const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const JournalEntry = sequelize.define("JournalEntry", {
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    particular: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("bill", "receipt"),
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    referenceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Receipts",
        key: "id",
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  return JournalEntry;
};
