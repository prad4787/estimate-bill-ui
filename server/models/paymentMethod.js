const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PaymentMethod = sequelize.define(
    "PaymentMethod",
    {
      type: {
        type: DataTypes.ENUM("cash", "bank", "wallet", "cheque"),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
        // name is required for bank and wallet types
        validate: {
          nameRequired(value) {
            if ((this.type === "bank" || this.type === "wallet") && !value) {
              throw new Error(
                "Name is required for bank and wallet payment methods"
              );
            }
          },
        },
      },
      accountName: {
        type: DataTypes.STRING,
        allowNull: true,
        // accountName is required for bank and wallet types
        validate: {
          accountNameRequired(value) {
            if ((this.type === "bank" || this.type === "wallet") && !value) {
              throw new Error(
                "Account name is required for bank and wallet payment methods"
              );
            }
          },
        },
      },
      accountNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        // accountNumber is required for bank and wallet types
        validate: {
          accountNumberRequired(value) {
            if ((this.type === "bank" || this.type === "wallet") && !value) {
              throw new Error(
                "Account number is required for bank and wallet payment methods"
              );
            }
          },
        },
      },
      balance: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["type"],
          where: {
            isDefault: true,
          },
        },
      ],
    }
  );

  return PaymentMethod;
};
