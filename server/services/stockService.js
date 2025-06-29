const { StockModel, BillItemModel, BillModel } = require("../models");
const { Op } = require("sequelize");

exports.listStocks = async ({ page = 1, limit = 10, search = "" }) => {
  const offset = (page - 1) * limit;

  const whereClause = {};
  if (search) {
    whereClause.name = {
      [Op.iLike]: `%${search}%`,
    };
  }

  const { count, rows } = await StockModel.findAndCountAll({
    where: whereClause,
    offset: Number(offset),
    limit: Number(limit),
    order: [["id", "DESC"]],
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
};

exports.getStock = async (id) => {
  return StockModel.findByPk(id);
};

exports.createStock = async (data) => {
  // If quantity is empty string or null, ensure status is untracked and set quantity to null
  if (data.quantity === "" || data.quantity === null) {
    data.status = "untracked";
    data.quantity = null;
  }
  return StockModel.create(data);
};

exports.updateStock = async (id, data) => {
  const stock = await StockModel.findByPk(id);
  if (!stock) return null;

  // If quantity is empty string or null, ensure status is untracked and set quantity to null
  if (data.quantity === "" || data.quantity === null) {
    data.status = "untracked";
    data.quantity = null;
  }

  await stock.update(data);
  return stock;
};

exports.deleteStock = async (id) => {
  const stock = await StockModel.findByPk(id);
  if (!stock) return false;
  await stock.destroy();
  return true;
};

exports.getStockStats = async () => {
  const [
    totalCount,
    trackedCount,
    untrackedCount,
    lowStockCount,
    outOfStockCount,
  ] = await Promise.all([
    // Total count
    StockModel.count(),

    // Tracked count (status = tracked)
    StockModel.count({
      where: {
        status: "tracked",
      },
    }),

    // Untracked count (status = untracked)
    StockModel.count({
      where: {
        status: "untracked",
      },
    }),

    // Low stock count (quantity < 10 and not null)
    StockModel.count({
      where: {
        quantity: {
          [Op.lt]: 10,
          [Op.ne]: null,
        },
      },
    }),

    // Out of stock count (quantity = 0)
    StockModel.count({
      where: {
        quantity: 0,
      },
    }),
  ]);

  return {
    total: totalCount,
    tracked: trackedCount,
    untracked: untrackedCount,
    lowStock: lowStockCount,
    outOfStock: outOfStockCount,
  };
};

exports.getStockBillItems = async (stockId, { page = 1, limit = 10 } = {}) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await BillItemModel.findAndCountAll({
    where: {
      stockId: stockId,
    },
    include: [
      {
        model: BillModel,
        as: "bill",
        attributes: ["number", "date"],
      },
    ],
    order: [["createdAt", "DESC"]],
    offset: Number(offset),
    limit: Number(limit),
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
};
