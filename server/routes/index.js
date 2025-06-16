const express = require("express");
const router = express.Router();
const authRoutes = require("./auth");
const clientRoutes = require("./client");
const journalEntryRoutes = require("./journalEntry");
const stockRoutes = require("./stock");
const organizationRoutes = require("./organization");
const paymentMethodRoutes = require("./paymentMethod");
const transactionRoutes = require("./transaction");
const receiptRoutes = require("./receipts");
const estimateRoutes = require("./estimate");

router.use("/auth", authRoutes);
// router.use(requireAuth);
router.use("/clients", clientRoutes);
router.use("/journal-entries", journalEntryRoutes);
router.use("/stocks", stockRoutes);
router.use("/organization", organizationRoutes);
router.use("/payment-methods", paymentMethodRoutes);
router.use("/transactions", transactionRoutes);

router.use("/api/receipts", receiptRoutes);
router.use("/api/estimates", estimateRoutes);

module.exports = router;
