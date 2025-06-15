const { JournalEntryModel, ClientModel } = require("../models");
const { Op } = require("sequelize");

exports.getClientJournalEntries = async (
  clientId,
  { page = 1, limit = 15, startDate, endDate, type }
) => {
  const offset = (page - 1) * limit;

  const where = { clientId };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date[Op.gte] = new Date(startDate);
    if (endDate) where.date[Op.lte] = new Date(endDate);
  }

  if (type && ["bill", "receipt"].includes(type)) {
    where.type = type;
  }

  const { count, rows } = await JournalEntryModel.findAndCountAll({
    where,
    include: [
      {
        model: ClientModel,
        as: "client",
        attributes: ["name", "openingBalance"],
      },
    ],
    order: [["date", "DESC"]],
    offset: Number(offset),
    limit: Number(limit),
  });

  // Calculate running balance
  const client = await ClientModel.findByPk(clientId);
  if (!client) return null;

  let runningBalance = client.openingBalance;
  const entries = rows.map((entry) => {
    const dr = entry.type === "bill" ? entry.amount : 0;
    const cr = entry.type === "receipt" ? entry.amount : 0;
    runningBalance += dr - cr;

    return {
      ...entry.toJSON(),
      dr,
      cr,
      balance: runningBalance,
    };
  });

  return {
    data: entries,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
};

exports.createJournalEntry = async (clientId, data) => {
  const client = await ClientModel.findByPk(clientId);
  if (!client) return null;

  return JournalEntryModel.create({
    ...data,
    clientId,
  });
};

exports.updateJournalEntry = async (id, data) => {
  const entry = await JournalEntryModel.findByPk(id);
  if (!entry) return null;

  await entry.update(data);
  return entry;
};

exports.deleteJournalEntry = async (id) => {
  const entry = await JournalEntryModel.findByPk(id);
  if (!entry) return false;

  await entry.destroy();
  return true;
};
