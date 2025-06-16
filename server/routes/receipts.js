const express = require("express");
const router = express.Router();
const receiptController = require("../controllers/receiptController");

// Apply authentication middleware to all routes

// List receipts with optional filtering
router.get("/", receiptController.listReceipts);

// Get a single receipt
router.get("/:id", receiptController.getReceipt);

// Create a new receipt
router.post("/", receiptController.createReceipt);

// Update a receipt
router.put("/:id", receiptController.updateReceipt);

// Delete a receipt
router.delete("/:id", receiptController.deleteReceipt);

module.exports = router;
