const { Transaction, Receipt, PaymentMethod, Client } = require("../models");
const { Op } = require("sequelize");

exports.listTransactions = async ({
  page,
  limit,
  startDate,
  endDate,
  paymentType,
  clientId,
}) => {
  const offset = (page - 1) * limit;
  const where = {};

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [new Date(startDate), new Date(endDate)],
    };
  }

  if (paymentType) {
    where.paymentType = paymentType;
  }

  if (clientId) {
    where["$Receipt.clientId$"] = clientId;
  }

  const { count, rows } = await Transaction.findAndCountAll({
    where,
    include: [
      {
        model: Receipt,
        include: [{ model: Client }],
      },
      {
        model: PaymentMethod,
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      pages: Math.ceil(count / limit),
    },
  };
};

exports.getTransaction = async (id) => {
  return await Transaction.findByPk(id, {
    include: [
      {
        model: Receipt,
        include: [{ model: Client }],
      },
      {
        model: PaymentMethod,
      },
    ],
  });
};

exports.createTransaction = async (data) => {
  const transaction = await Transaction.create(data);

  // If payment method is specified, update its balance
  if (data.paymentMethodId) {
    const paymentMethod = await PaymentMethod.findByPk(data.paymentMethodId);
    if (paymentMethod) {
      await paymentMethod.update({
        balance: paymentMethod.balance + parseFloat(data.amount),
      });
    }
  }

  return await this.getTransaction(transaction.id);
};

exports.updateTransaction = async (id, data) => {
  const transaction = await Transaction.findByPk(id);
  if (!transaction) return null;

  // If payment method is being changed, update balances
  if (data.paymentMethodId !== transaction.paymentMethodId) {
    // Remove amount from old payment method
    if (transaction.paymentMethodId) {
      const oldPaymentMethod = await PaymentMethod.findByPk(
        transaction.paymentMethodId
      );
      if (oldPaymentMethod) {
        await oldPaymentMethod.update({
          balance: oldPaymentMethod.balance - parseFloat(transaction.amount),
        });
      }
    }

    // Add amount to new payment method
    if (data.paymentMethodId) {
      const newPaymentMethod = await PaymentMethod.findByPk(
        data.paymentMethodId
      );
      if (newPaymentMethod) {
        await newPaymentMethod.update({
          balance: newPaymentMethod.balance + parseFloat(data.amount),
        });
      }
    }
  } else if (data.amount !== transaction.amount && data.paymentMethodId) {
    // If only amount is changing, update the payment method balance
    const paymentMethod = await PaymentMethod.findByPk(data.paymentMethodId);
    if (paymentMethod) {
      const difference =
        parseFloat(data.amount) - parseFloat(transaction.amount);
      await paymentMethod.update({
        balance: paymentMethod.balance + difference,
      });
    }
  }

  await transaction.update(data);
  return await this.getTransaction(id);
};

exports.deleteTransaction = async (id) => {
  const transaction = await Transaction.findByPk(id);
  if (!transaction) return false;

  // Update payment method balance if exists
  if (transaction.paymentMethodId) {
    const paymentMethod = await PaymentMethod.findByPk(
      transaction.paymentMethodId
    );
    if (paymentMethod) {
      await paymentMethod.update({
        balance: paymentMethod.balance - parseFloat(transaction.amount),
      });
    }
  }

  await transaction.destroy();
  return true;
};

exports.getTransactionStats = async ({ startDate, endDate, paymentType }) => {
  const where = {};

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [new Date(startDate), new Date(endDate)],
    };
  }

  if (paymentType) {
    where.paymentType = paymentType;
  }

  const stats = await Transaction.findAll({
    where,
    attributes: [
      "paymentType",
      [sequelize.fn("SUM", sequelize.col("amount")), "totalAmount"],
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    group: ["paymentType"],
  });

  const totalStats = await Transaction.findAll({
    where,
    attributes: [
      [sequelize.fn("SUM", sequelize.col("amount")), "totalAmount"],
      [sequelize.fn("COUNT", sequelize.col("id")), "totalCount"],
    ],
  });

  return {
    byPaymentType: stats,
    total: totalStats[0],
  };
};
