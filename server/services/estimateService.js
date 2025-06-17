const { EstimateModel, ClientModel } = require("../models");
const { Op } = require("sequelize");
const billService = require("./billService");

// Helper function to calculate totals
const calculateTotals = (items, discountType, discountValue) => {
  const subTotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount =
    discountType === "rate" ? (subTotal * discountValue) / 100 : discountValue;
  const total = subTotal - discountAmount;

  return { subTotal, discountAmount, total };
};

// Helper function to generate estimate number
const generateEstimateNumber = async () => {
  const lastEstimate = await EstimateModel.findOne({
    order: [["createdAt", "DESC"]],
  });

  const currentYear = new Date().getFullYear();
  const lastNumber = lastEstimate
    ? parseInt(lastEstimate.number.split("-")[1])
    : 0;
  const newNumber = lastNumber + 1;
  return `EST-${currentYear}-${newNumber.toString().padStart(4, "0")}`;
};

exports.listEstimates = async ({ page = 1, limit = 10, search = "" }) => {
  const offset = (page - 1) * limit;
  const where = {};

  if (search) {
    where[Op.or] = [
      { number: { [Op.like]: `%${search}%` } },
      { "$client.name$": { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await EstimateModel.findAndCountAll({
    where,
    include: [
      {
        model: ClientModel,
        as: "client",
        attributes: ["name"],
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

exports.getEstimate = async (id) => {
  return EstimateModel.findByPk(id, {
    include: [
      {
        model: ClientModel,
        as: "client",
        attributes: ["name", "address", "panVat"],
      },
    ],
  });
};

exports.createEstimate = async (data) => {
  const { items, discountType, discountValue } = data;
  const { subTotal, discountAmount, total } = calculateTotals(
    items,
    discountType,
    discountValue
  );

  const number = await generateEstimateNumber();
  const id = `estimate_${Date.now()}`;

  // Create the estimate
  const estimate = await EstimateModel.create({
    id,
    number,
    ...data,
    subTotal,
    discountAmount,
    total,
  });

  // Also create a bill from the estimate
  const bill = await billService.createBill({
    date: data.date,
    clientId: data.clientId,
    items: data.items,
    discountType: data.discountType,
    discountValue: data.discountValue,
  });

  return {
    ...estimate.toJSON(),
    bill,
  };
};

exports.updateEstimate = async (id, data) => {
  const estimate = await EstimateModel.findByPk(id);
  if (!estimate) return null;

  const { items, discountType, discountValue } = data;
  const { subTotal, discountAmount, total } = calculateTotals(
    items,
    discountType,
    discountValue
  );

  await estimate.update({
    ...data,
    subTotal,
    discountAmount,
    total,
  });

  return estimate;
};

exports.deleteEstimate = async (id) => {
  const estimate = await EstimateModel.findByPk(id);
  if (!estimate) return false;
  await estimate.destroy();
  return true;
};
