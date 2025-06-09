const { ClientModel } = require("../models");

exports.listClients = async ({ page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await ClientModel.findAndCountAll({
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

exports.getClient = async (id) => {
  return ClientModel.findByPk(id);
};

exports.createClient = async (data) => {
  return ClientModel.create(data);
};

exports.updateClient = async (id, data) => {
  const client = await ClientModel.findByPk(id);
  if (!client) return null;
  await client.update(data);
  return client;
};

exports.deleteClient = async (id) => {
  const client = await ClientModel.findByPk(id);
  if (!client) return false;
  await client.destroy();
  return true;
};
