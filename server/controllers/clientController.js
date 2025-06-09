const clientService = require("../services/clientService");
const { validateClientInput } = require("../utils/validate");

exports.listClients = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await clientService.listClients({ page, limit });
    res.apiPaginated(result.data, result.pagination);
  } catch (err) {
    next(err);
  }
};

exports.getClient = async (req, res, next) => {
  try {
    const client = await clientService.getClient(req.params.id);
    if (!client) return res.apiError("Client not found", 404);
    res.apiSuccess(client);
  } catch (err) {
    next(err);
  }
};

exports.createClient = async (req, res, next) => {
  const { valid, errors } = validateClientInput(req.body);
  if (!valid) {
    return res.apiValidationError(errors);
  }
  try {
    const client = await clientService.createClient(req.body);
    res.apiSuccess(client, "Client created", 201);
  } catch (err) {
    next(err);
  }
};

exports.updateClient = async (req, res, next) => {
  try {
    const client = await clientService.updateClient(req.params.id, req.body);
    if (!client) return res.apiError("Client not found", 404);
    res.apiSuccess(client, "Client updated");
  } catch (err) {
    next(err);
  }
};

exports.deleteClient = async (req, res, next) => {
  try {
    const deleted = await clientService.deleteClient(req.params.id);
    if (!deleted) return res.apiError("Client not found", 404);
    res.apiSuccess(null, "Client deleted");
  } catch (err) {
    next(err);
  }
};
