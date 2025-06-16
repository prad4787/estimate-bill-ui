const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const { requireAuth } = require("../utils/auth");

// Apply authentication middleware to all routes

// List transactions with optional filtering
router.get("/", transactionController.listTransactions);

// Get transaction statistics
router.get("/stats", transactionController.getTransactionStats);

// Get a single transaction
router.get("/:id", transactionController.getTransaction);

// Create a new transaction
router.post("/", transactionController.createTransaction);

// Update a transaction
router.put("/:id", transactionController.updateTransaction);

// Delete a transaction
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;
