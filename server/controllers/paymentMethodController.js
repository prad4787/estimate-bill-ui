const paymentMethodService = require("../services/paymentMethodService");

const validatePaymentMethod = (data) => {
  const errors = [];

  if (!data.type) {
    errors.push("Payment type is required");
  } else if (!["cash", "bank", "wallet", "cheque"].includes(data.type)) {
    errors.push("Invalid payment type");
  }

  if (data.type === "bank" || data.type === "wallet") {
    if (!data.name)
      errors.push("Name is required for bank and wallet payment methods");
    if (!data.accountName)
      errors.push(
        "Account name is required for bank and wallet payment methods"
      );
    if (!data.accountNumber)
      errors.push(
        "Account number is required for bank and wallet payment methods"
      );
  }

  if (data.balance !== undefined && (isNaN(data.balance) || data.balance < 0)) {
    errors.push("Balance must be a valid positive number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

exports.listPaymentMethods = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await paymentMethodService.listPaymentMethods({
      page,
      limit,
    });
    res.apiPaginated(result.data, result.pagination);
  } catch (err) {
    next(err);
  }
};

exports.getPaymentMethod = async (req, res, next) => {
  try {
    const method = await paymentMethodService.getPaymentMethod(req.params.id);
    if (!method) return res.apiError("Payment method not found", 404);
    res.apiSuccess(method);
  } catch (err) {
    next(err);
  }
};

exports.createPaymentMethod = async (req, res, next) => {
  const { valid, errors } = validatePaymentMethod(req.body);
  if (!valid) {
    return res.apiValidationError(errors);
  }

  try {
    const method = await paymentMethodService.createPaymentMethod(req.body);
    res.apiSuccess(method, "Payment method created", 201);
  } catch (err) {
    if (err.message.includes("already exists")) {
      return res.apiError(err.message, 400);
    }
    next(err);
  }
};

exports.updatePaymentMethod = async (req, res, next) => {
  const { valid, errors } = validatePaymentMethod(req.body);
  if (!valid) {
    return res.apiValidationError(errors);
  }

  try {
    const method = await paymentMethodService.updatePaymentMethod(
      req.params.id,
      req.body
    );
    if (!method) return res.apiError("Payment method not found", 404);
    res.apiSuccess(method, "Payment method updated");
  } catch (err) {
    if (
      err.message.includes("Cannot update") ||
      err.message.includes("already exists")
    ) {
      return res.apiError(err.message, 400);
    }
    next(err);
  }
};

exports.deletePaymentMethod = async (req, res, next) => {
  try {
    const deleted = await paymentMethodService.deletePaymentMethod(
      req.params.id
    );
    if (!deleted) return res.apiError("Payment method not found", 404);
    res.apiSuccess(null, "Payment method deleted");
  } catch (err) {
    if (err.message.includes("Cannot delete")) {
      return res.apiError(err.message, 400);
    }
    next(err);
  }
};

exports.updateBalance = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (amount === undefined || isNaN(amount)) {
      return res.apiValidationError([
        "Amount is required and must be a number",
      ]);
    }

    const method = await paymentMethodService.updateBalance(
      req.params.id,
      Number(amount)
    );
    if (!method) return res.apiError("Payment method not found", 404);
    res.apiSuccess(method, "Balance updated");
  } catch (err) {
    if (err.message === "Insufficient balance") {
      return res.apiError(err.message, 400);
    }
    next(err);
  }
};
