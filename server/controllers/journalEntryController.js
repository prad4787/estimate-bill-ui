const journalEntryService = require("../services/journalEntryService");

exports.getClientJournalEntries = async (req, res, next) => {
  try {
    const { page, limit, startDate, endDate, type } = req.query;
    const result = await journalEntryService.getClientJournalEntries(
      req.params.clientId,
      {
        page,
        limit,
        startDate,
        endDate,
        type,
      }
    );

    if (!result) {
      return res.apiError("Client not found", 404);
    }

    res.apiPaginated(result.data, result.pagination);
  } catch (err) {
    next(err);
  }
};

exports.createJournalEntry = async (req, res, next) => {
  try {
    const entry = await journalEntryService.createJournalEntry(
      req.params.clientId,
      req.body
    );
    if (!entry) {
      return res.apiError("Client not found", 404);
    }
    res.apiSuccess(entry, "Journal entry created", 201);
  } catch (err) {
    next(err);
  }
};

exports.updateJournalEntry = async (req, res, next) => {
  try {
    const entry = await journalEntryService.updateJournalEntry(
      req.params.id,
      req.body
    );
    if (!entry) {
      return res.apiError("Journal entry not found", 404);
    }
    res.apiSuccess(entry, "Journal entry updated");
  } catch (err) {
    next(err);
  }
};

exports.deleteJournalEntry = async (req, res, next) => {
  try {
    const deleted = await journalEntryService.deleteJournalEntry(req.params.id);
    if (!deleted) {
      return res.apiError("Journal entry not found", 404);
    }
    res.apiSuccess(null, "Journal entry deleted");
  } catch (err) {
    next(err);
  }
};
