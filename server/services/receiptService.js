const {
  ReceiptModel,
  TransactionModel,
  ClientModel,
  PaymentMethodModel,
  JournalEntryModel,
} = require("../models");
const { Op } = require("sequelize");

exports.listReceipts = async ({
  page = 1,
  limit = 10,
  startDate,
  endDate,
  clientId,
} = {}) => {
  const where = {};
  if (startDate && endDate) {
    where.date = {
      [Op.between]: [startDate, endDate],
    };
  }
  if (clientId) {
    where.clientId = clientId;
  }

  const { count, rows } = await ReceiptModel.findAndCountAll({
    where,
    include: [
      {
        model: ClientModel,
        as: "client",
      },
      {
        model: TransactionModel,
        as: "transactions",
        include: [
          {
            model: PaymentMethodModel,
            as: "paymentMethod",
          },
        ],
      },
    ],
    order: [["date", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });

  return {
    data: rows,
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(count / limit),
  };
};

exports.getReceipt = async (id) => {
  return await ReceiptModel.findByPk(id, {
    include: [
      {
        model: ClientModel,
        as: "client",
      },
      {
        model: TransactionModel,
        as: "transactions",
        include: [
          {
            model: PaymentMethodModel,
            as: "paymentMethod",
          },
        ],
      },
    ],
  });
};

exports.createReceipt = async (receiptData) => {
  const { clientId, transactions = [], ...receiptDetails } = receiptData;

  // Validate client exists
  const client = await ClientModel.findByPk(clientId);
  if (!client) {
    throw new Error("Client not found");
  }

  // Validate payment methods exist only for non-cash transactions
  const paymentMethodIds = transactions
    .filter((t) => t.paymentType !== "cash" && t.paymentMethodId)
    .map((t) => t.paymentMethodId);
  if (paymentMethodIds.length > 0) {
    const paymentMethods = await PaymentMethodModel.findAll({
      where: { id: { [Op.in]: paymentMethodIds } },
    });
    if (paymentMethods.length !== paymentMethodIds.length) {
      throw new Error("One or more payment methods not found");
    }
  }

  const result = await ReceiptModel.sequelize.transaction(async (t) => {
    // Create receipt
    const receipt = await ReceiptModel.create(
      {
        ...receiptDetails,
        clientId,
        date: receiptDetails.date || new Date(),
      },
      { transaction: t }
    );

    // Create transactions
    const createdTransactions = await TransactionModel.bulkCreate(
      transactions.map((transaction) => ({
        ...transaction,
        receiptId: receipt.id,
      })),
      { transaction: t }
    );

    // Create journal entry
    const totalAmount = transactions.reduce(
      (sum, t) => sum + (parseFloat(t.amount) || 0),
      0
    );
    await JournalEntryModel.create(
      {
        date: receipt.date,
        particular: `Receipt from ${client.name}`,
        type: "receipt",
        amount: totalAmount,
        referenceId: receipt.id,
        notes: receiptDetails.notes,
      },
      { transaction: t }
    );

    return {
      ...receipt.toJSON(),
      transactions: createdTransactions,
    };
  });

  return result;
};

exports.updateReceipt = async (id, receiptData) => {
  const { transactions, ...receiptFields } = receiptData;

  // Validate transactions before starting transaction
  for (const transaction of transactions) {
    if (transaction.paymentType === "cheque" && !transaction.chequeDetails) {
      throw new Error("Cheque details are required for cheque payments");
    }
    if (
      (transaction.paymentType === "bank" ||
        transaction.paymentType === "wallet") &&
      !transaction.paymentMethodId
    ) {
      throw new Error(
        "Payment method is required for bank and wallet payments"
      );
    }
  }

  // Calculate total from transactions
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Start a transaction
  const result = await ReceiptModel.sequelize.transaction(async (t) => {
    try {
      const receipt = await ReceiptModel.findByPk(id, {
        include: [
          {
            model: TransactionModel,
            as: "transactions",
          },
        ],
        transaction: t,
      });

      if (!receipt) {
        throw new Error("Receipt not found");
      }

      // Update receipt
      await receipt.update(
        {
          ...receiptFields,
          total,
        },
        { transaction: t }
      );

      // Delete existing transactions
      await TransactionModel.destroy({
        where: { receiptId: id },
        transaction: t,
      });

      // Create new transactions
      const createdTransactions = await Promise.all(
        transactions.map((transaction) =>
          TransactionModel.create(
            {
              ...transaction,
              receiptId: receipt.id,
            },
            { transaction: t }
          )
        )
      );

      // Update journal entry
      const journalEntry = await JournalEntryModel.findOne({
        where: {
          type: "receipt",
          referenceId: id,
        },
        transaction: t,
      });

      if (journalEntry) {
        await journalEntry.update(
          {
            date: receipt.date,
            particular: `Receipt from ${receipt.clientId}`,
            amount: total,
          },
          { transaction: t }
        );
      }

      // Update payment method balances
      // First, revert old transaction amounts
      for (const oldTransaction of receipt.transactions) {
        if (oldTransaction.paymentMethodId) {
          const paymentMethod = await PaymentMethodModel.findByPk(
            oldTransaction.paymentMethodId,
            { transaction: t }
          );
          if (paymentMethod) {
            await paymentMethod.update(
              {
                balance: paymentMethod.balance - oldTransaction.amount,
              },
              { transaction: t }
            );
          }
        }
      }

      // Then, apply new transaction amounts
      for (const transaction of createdTransactions) {
        if (transaction.paymentMethodId) {
          const paymentMethod = await PaymentMethodModel.findByPk(
            transaction.paymentMethodId,
            { transaction: t }
          );
          if (!paymentMethod) {
            throw new Error(
              `Payment method ${transaction.paymentMethodId} not found`
            );
          }
          await paymentMethod.update(
            {
              balance: paymentMethod.balance + transaction.amount,
            },
            { transaction: t }
          );
        }
      }

      // Return updated receipt
      return await ReceiptModel.findByPk(id, {
        include: [
          {
            model: ClientModel,
            as: "client",
          },
          {
            model: TransactionModel,
            as: "transactions",
            include: [
              {
                model: PaymentMethodModel,
                as: "paymentMethod",
              },
            ],
          },
        ],
        transaction: t,
      });
    } catch (error) {
      // Add more context to the error
      if (error.name === "SequelizeValidationError") {
        const messages = error.errors.map((e) => e.message);
        throw new Error(`Validation error: ${messages.join(", ")}`);
      }
      throw error;
    }
  });

  return result;
};

exports.deleteReceipt = async (id) => {
  return await ReceiptModel.sequelize.transaction(async (t) => {
    const receipt = await ReceiptModel.findByPk(id, {
      include: [
        {
          model: TransactionModel,
          as: "transactions",
        },
      ],
      transaction: t,
    });

    if (!receipt) {
      throw new Error("Receipt not found");
    }

    // Revert payment method balances
    for (const transaction of receipt.transactions) {
      if (transaction.paymentMethodId) {
        const paymentMethod = await PaymentMethodModel.findByPk(
          transaction.paymentMethodId,
          { transaction: t }
        );
        if (paymentMethod) {
          await paymentMethod.update(
            {
              balance: paymentMethod.balance - transaction.amount,
            },
            { transaction: t }
          );
        }
      }
    }

    // Delete journal entry
    await JournalEntryModel.destroy({
      where: {
        type: "receipt",
        referenceId: id,
      },
      transaction: t,
    });

    // Delete receipt (transactions will be deleted via cascade)
    await receipt.destroy({ transaction: t });

    return true;
  });
};
