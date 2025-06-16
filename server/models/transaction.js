const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Transaction = sequelize.define("Transaction", {
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    paymentType: {
      type: DataTypes.ENUM("cash", "bank", "wallet", "cheque"),
      allowNull: false,
      validate: {
        isValidPaymentType(value) {
          if (!["cash", "bank", "wallet", "cheque"].includes(value)) {
            throw new Error("Invalid payment type");
          }
        },
      },
    },
    receiptId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Receipts",
        key: "id",
      },
    },
    paymentMethodId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "PaymentMethods",
        key: "id",
      },
      validate: {
        paymentMethodRequired(value) {
          if (
            (this.paymentType === "bank" || this.paymentType === "wallet") &&
            !value
          ) {
            throw new Error(
              "Payment method is required for bank and wallet payments"
            );
          }
        },
      },
    },
    chequeDetails: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        chequeDetailsRequired(value) {
          if (this.paymentType === "cheque") {
            if (!value) {
              throw new Error(
                "Cheque details are required for cheque payments"
              );
            }
            const requiredFields = [
              "bankName",
              "chequeNumber",
              "branchName",
              "issueDate",
            ];
            const missingFields = requiredFields.filter(
              (field) => !value[field]
            );
            if (missingFields.length > 0) {
              throw new Error(
                `Missing required cheque details: ${missingFields.join(", ")}`
              );
            }
          }
        },
      },
    },
  });

  return Transaction;
};
