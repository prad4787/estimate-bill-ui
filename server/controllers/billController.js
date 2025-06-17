const billService = require("../services/billService");

exports.listBills = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const result = await billService.listBills({ page, limit, search });
    res.apiPaginated(result.data, result.pagination);
  } catch (err) {
    next(err);
  }
};

exports.getBill = async (req, res, next) => {
  try {
    const bill = await billService.getBill(req.params.id);
    if (!bill) return res.apiError("Bill not found", 404);
    res.apiSuccess(bill);
  } catch (err) {
    next(err);
  }
};

exports.createBill = async (req, res, next) => {
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

    const bill = await billService.createBill({
      date,
      clientId,
      items,
      discountType,
      discountValue,
    });

    res.apiSuccess(bill);
  } catch (err) {
    next(err);
  }
};
