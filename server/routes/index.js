const express = require("express");
const router = express.Router();
const authRoutes = require("./auth");
const clientRoutes = require("./client");

router.use("/auth", authRoutes);
// router.use(requireAuth);
router.use("/clients", clientRoutes);

module.exports = router;
