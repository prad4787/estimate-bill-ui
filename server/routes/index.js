const express = require("express");
const router = express.Router();
const authRoutes = require("./auth");
const clientRoutes = require("./client");
const journalEntryRoutes = require("./journalEntry");
const stockRoutes = require("./stock");
const organizationRoutes = require("./organization");

router.use("/auth", authRoutes);
// router.use(requireAuth);
router.use("/clients", clientRoutes);
router.use("/journal", journalEntryRoutes);
router.use("/stocks", stockRoutes);
router.use("/organization", organizationRoutes);

module.exports = router;
