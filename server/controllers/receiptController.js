const receiptService = require("../services/receiptService");

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

exports.listReceipts = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, clientId } = req.query;
    const result = await receiptService.listReceipts({
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate,
      clientId,
    });
    res.apiSuccess(result);
  } catch (error) {
    res.apiError(error.message);
  }
};

exports.getReceipt = async (req, res) => {
  try {
    const receipt = await receiptService.getReceipt(req.params.id);
    if (!receipt) {
      return res.apiError("Receipt not found", 404);
    }
    res.apiSuccess(receipt);
  } catch (error) {
    res.apiError(error.message);
  }
};

exports.createReceipt = async (req, res) => {
  try {
    const { date, clientId, notes, transactions } = req.body;

    // Validate required fields
    if (!date || !clientId || !transactions || !transactions.length) {
      return res.apiError(
        "Date, client, and at least one transaction are required"
      );
    }

    // Validate each transaction
    const transactionErrors = transactions.flatMap(validateTransaction);
    if (transactionErrors.length > 0) {
      return res.apiValidationError(transactionErrors);
    }

    // Calculate total from transactions
    const total = transactions.reduce(
      (sum, t) => sum + parseFloat(t.amount),
      0
    );

    const receipt = await receiptService.createReceipt({
      date,
      clientId,
      notes,
      transactions,
      total,
    });

    res.apiSuccess({ data: receipt, message: "Receipt created" }, 201);
  } catch (error) {
    res.apiError(error.message);
  }
};

exports.updateReceipt = async (req, res) => {
  try {
    const { date, clientId, notes, transactions } = req.body;

    // Validate required fields
    if (!date || !clientId || !transactions || !transactions.length) {
      return res.apiError(
        "Date, client, and at least one transaction are required"
      );
    }

    // Calculate total from transactions
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);

    const receipt = await receiptService.updateReceipt(req.params.id, {
      date,
      clientId,
      notes,
      transactions,
      total,
    });

    if (!receipt) {
      return res.apiError("Receipt not found", 404);
    }

    res.apiSuccess(receipt);
  } catch (error) {
    res.apiError(error.message);
  }
};

exports.deleteReceipt = async (req, res) => {
  try {
    const success = await receiptService.deleteReceipt(req.params.id);
    if (!success) {
      return res.apiError("Receipt not found", 404);
    }
    res.apiSuccess(null, 204);
  } catch (error) {
    res.apiError(error.message);
  }
};
