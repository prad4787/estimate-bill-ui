const estimateService = require("../services/estimateService");

exports.listEstimates = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const result = await estimateService.listEstimates({ page, limit, search });
    res.apiPaginated(result.data, result.pagination);
  } catch (err) {
    next(err);
  }
};

exports.getEstimate = async (req, res, next) => {
  try {
    const estimate = await estimateService.getEstimate(req.params.id);
    if (!estimate) return res.apiError("Estimate not found", 404);
    res.apiSuccess(estimate);
  } catch (err) {
    next(err);
  }
};

exports.createEstimate = async (req, res, next) => {
  try {
    const { date, clientId, items, discountType, discountValue } = req.body;

    // Basic validation
    if (
      !date ||
      !clientId ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.apiValidationError([
        "Date, client ID, and at least one item are required",
      ]);
    }

    if (
      items.some((item) => !item.item || item.quantity <= 0 || item.rate <= 0)
    ) {
      return res.apiValidationError([
        "All items must have a name, positive quantity, and positive rate",
      ]);
    }

    const estimate = await estimateService.createEstimate({
      date,
      clientId,
      items,
      discountType,
      discountValue,
    });

    res.apiSuccess(estimate, "Estimate created successfully", 201);
  } catch (err) {
    next(err);
  }
};

exports.updateEstimate = async (req, res, next) => {
  try {
    const { date, clientId, items, discountType, discountValue } = req.body;

    // Basic validation
    if (
      !date ||
      !clientId ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.apiValidationError([
        "Date, client ID, and at least one item are required",
      ]);
    }

    if (
      items.some((item) => !item.item || item.quantity <= 0 || item.rate <= 0)
    ) {
      return res.apiValidationError([
        "All items must have a name, positive quantity, and positive rate",
      ]);
    }

    const estimate = await estimateService.updateEstimate(req.params.id, {
      date,
      clientId,
      items,
      discountType,
      discountValue,
    });

    if (!estimate) return res.apiError("Estimate not found", 404);
    res.apiSuccess(estimate, "Estimate updated successfully");
  } catch (err) {
    next(err);
  }
};

exports.deleteEstimate = async (req, res, next) => {
  try {
    const deleted = await estimateService.deleteEstimate(req.params.id);
    if (!deleted) return res.apiError("Estimate not found", 404);
    res.apiSuccess(null, "Estimate deleted successfully");
  } catch (err) {
    next(err);
  }
};
