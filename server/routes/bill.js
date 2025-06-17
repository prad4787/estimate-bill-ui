const express = require("express");
const router = express.Router();
const billController = require("../controllers/billController");

// Apply authentication middleware to all routes

// List bills with optional search and pagination
router.get("/", billController.listBills);

// Get single bill
router.get("/:id", billController.getBill);

// Create new bill
router.post("/", billController.createBill);

module.exports = router;
