const express = require("express");
const router = express.Router();
const journalEntryController = require("../controllers/journalEntryController");
const { requireAuth } = require("../utils/auth");

// Get client journal entries
router.get(
  "/clients/:clientId/entries",
  journalEntryController.getClientJournalEntries
);

// Create journal entry for client
router.post(
  "/clients/:clientId/entries",
  journalEntryController.createJournalEntry
);

// Update journal entry
router.put("/entries/:id", journalEntryController.updateJournalEntry);

// Delete journal entry
router.delete("/entries/:id", journalEntryController.deleteJournalEntry);

module.exports = router;
