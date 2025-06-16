const transactionService = require("../services/transactionService");

const validateTransaction = (transaction) => {
  const errors = [];

  if (
    !transaction.amount ||
    isNaN(transaction.amount) ||
    transaction.amount <= 0
  ) {
    errors.push("Transaction amount is required and must be a positive number");
  }

  if (!transaction.paymentType) {
    errors.push("Payment type is required");
  } else if (
    !["cash", "bank", "wallet", "cheque"].includes(transaction.paymentType)
  ) {
    errors.push("Invalid payment type");
  }

  if (
    transaction.paymentType === "bank" ||
    transaction.paymentType === "wallet"
  ) {
    if (!transaction.paymentMethodId) {
      errors.push("Payment method is required for bank and wallet payments");
    }
  }

  if (transaction.paymentType === "cheque") {
    if (!transaction.chequeDetails) {
      errors.push("Cheque details are required for cheque payments");
    } else {
      const requiredFields = [
        "bankName",
        "chequeNumber",
        "branchName",
        "issueDate",
      ];
      const missingFields = requiredFields.filter(
        (field) => !transaction.chequeDetails[field]
      );
      if (missingFields.length > 0) {
        errors.push(
          `Missing required cheque details: ${missingFields.join(", ")}`
        );
      }
    }
  }

  return errors;
};

exports.listTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      paymentType,
      clientId,
    } = req.query;
    const result = await transactionService.listTransactions({
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate,
      paymentType,
      clientId,
    });
    res.apiPaginated(result.data, result.pagination);
  } catch (error) {
    res.apiError(error.message);
  }
};

exports.getTransaction = async (req, res) => {
  try {
    const transaction = await transactionService.getTransaction(req.params.id);
    if (!transaction) {
      return res.apiError("Transaction not found", 404);
    }
    res.apiSuccess(transaction);
  } catch (error) {
    res.apiError(error.message);
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const errors = validateTransaction(req.body);
    if (errors.length > 0) {
      return res.apiValidationError(errors);
    }

    const transaction = await transactionService.createTransaction(req.body);
    res.apiSuccess(transaction, "Transaction created successfully", 201);
  } catch (error) {
    res.apiError(error.message);
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const errors = validateTransaction(req.body);
    if (errors.length > 0) {
      return res.apiValidationError(errors);
    }

    const transaction = await transactionService.updateTransaction(
      req.params.id,
      req.body
    );
    if (!transaction) {
      return res.apiError("Transaction not found", 404);
    }
    res.apiSuccess(transaction, "Transaction updated successfully");
  } catch (error) {
    res.apiError(error.message);
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const deleted = await transactionService.deleteTransaction(req.params.id);
    if (!deleted) {
      return res.apiError("Transaction not found", 404);
    }
    res.apiSuccess(null, "Transaction deleted successfully");
  } catch (error) {
    res.apiError(error.message);
  }
};

exports.getTransactionStats = async (req, res) => {
  try {
    const { startDate, endDate, paymentType } = req.query;
    const stats = await transactionService.getTransactionStats({
      startDate,
      endDate,
      paymentType,
    });
    res.apiSuccess(stats);
  } catch (error) {
    res.apiError(error.message);
  }
};
