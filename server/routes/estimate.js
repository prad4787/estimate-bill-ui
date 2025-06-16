const express = require("express");
const router = express.Router();
const estimateController = require("../controllers/estimateController");

// Apply authentication middleware to all routes

// List estimates with optional search and pagination
router.get("/", estimateController.listEstimates);

// Get single estimate
router.get("/:id", estimateController.getEstimate);

// Create new estimate
router.post("/", estimateController.createEstimate);

// Update estimate
router.put("/:id", estimateController.updateEstimate);

// Delete estimate
router.delete("/:id", estimateController.deleteEstimate);

module.exports = router;
