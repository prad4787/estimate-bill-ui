const stockService = require("../services/stockService");

exports.listStocks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const result = await stockService.listStocks({ page, limit, search });
    res.apiPaginated(result.data, result.pagination);
  } catch (err) {
    next(err);
  }
};

exports.getStock = async (req, res, next) => {
  try {
    const stock = await stockService.getStock(req.params.id);
    if (!stock) return res.apiError("Stock not found", 404);
    res.apiSuccess(stock);
  } catch (err) {
    next(err);
  }
};

exports.createStock = async (req, res, next) => {
  try {
    const { name, quantity, status } = req.body;
    if (!name) {
      return res.apiValidationError(["Name is required"]);
    }
    const stock = await stockService.createStock({ name, quantity, status });
    res.apiSuccess(stock);
  } catch (err) {
    next(err);
  }
};

exports.updateStock = async (req, res, next) => {
  try {
    const stock = await stockService.updateStock(req.params.id, req.body);
    if (!stock) return res.apiError("Stock not found", 404);
    res.apiSuccess(stock, "Stock updated");
  } catch (err) {
    next(err);
  }
};

exports.deleteStock = async (req, res, next) => {
  try {
    const deleted = await stockService.deleteStock(req.params.id);
    if (!deleted) return res.apiError("Stock not found", 404);
    res.apiSuccess(null, "Stock deleted");
  } catch (err) {
    next(err);
  }
};

exports.getStockStats = async (req, res, next) => {
  try {
    const stats = await stockService.getStockStats();
    res.apiSuccess(stats);
  } catch (err) {
    next(err);
  }
};

exports.getStockBillItems = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await stockService.getStockBillItems(req.params.id, {
      page,
      limit,
    });
    res.apiPaginated(result.data, result.pagination);
  } catch (err) {
    next(err);
  }
};
