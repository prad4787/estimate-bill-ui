const { PaymentMethodModel } = require("../models");
const { Op } = require("sequelize");

const listPaymentMethods = async ({ page = 1, limit = 10 }) => {
  try {
    const offset = (page - 1) * limit;
    const { count, rows } = await PaymentMethodModel.findAndCountAll({
      offset: Number(offset),
      limit: Number(limit),
      order: [
        ["isDefault", "DESC"],
        ["type", "ASC"],
      ],
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    console.error("Error listing payment methods:", error);
    throw error;
  }
};

const getPaymentMethod = async (id) => {
  try {
    return await PaymentMethodModel.findByPk(id);
  } catch (error) {
    console.error("Error getting payment method:", error);
    throw error;
  }
};

const createPaymentMethod = async (data) => {
  try {
    // Check if trying to create a default method that already exists
    if (data.isDefault) {
      const existingDefault = await PaymentMethodModel.findOne({
        where: {
          type: data.type,
          isDefault: true,
        },
      });
      if (existingDefault) {
        throw new Error(`A default ${data.type} payment method already exists`);
      }
    }

    return await PaymentMethodModel.create(data);
  } catch (error) {
    console.error("Error creating payment method:", error);
    throw error;
  }
};

const updatePaymentMethod = async (id, data) => {
  try {
    const method = await PaymentMethodModel.findByPk(id);
    if (!method) return null;

    // Prevent updating default payment methods
    if (
      method.isDefault &&
      (method.type === "cash" || method.type === "cheque")
    ) {
      throw new Error("Cannot update default cash or cheque payment methods");
    }

    // Check if trying to make it default when another default exists
    if (data.isDefault) {
      const existingDefault = await PaymentMethodModel.findOne({
        where: {
          type: method.type,
          isDefault: true,
          id: { [Op.ne]: id },
        },
      });
      if (existingDefault) {
        throw new Error(
          `A default ${method.type} payment method already exists`
        );
      }
    }

    await method.update(data);
    return method;
  } catch (error) {
    console.error("Error updating payment method:", error);
    throw error;
  }
};

const deletePaymentMethod = async (id) => {
  try {
    const method = await PaymentMethodModel.findByPk(id);
    if (!method) return false;

    // Prevent deleting default payment methods
    if (
      method.isDefault &&
      (method.type === "cash" || method.type === "cheque")
    ) {
      throw new Error("Cannot delete default cash or cheque payment methods");
    }

    await method.destroy();
    return true;
  } catch (error) {
    console.error("Error deleting payment method:", error);
    throw error;
  }
};

const updateBalance = async (id, amount) => {
  try {
    const method = await PaymentMethodModel.findByPk(id);
    if (!method) return null;

    const newBalance = (method.balance || 0) + amount;
    if (newBalance < 0) {
      throw new Error("Insufficient balance");
    }

    await method.update({ balance: newBalance });
    return method;
  } catch (error) {
    console.error("Error updating payment method balance:", error);
    throw error;
  }
};

module.exports = {
  listPaymentMethods,
  getPaymentMethod,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  updateBalance,
};
