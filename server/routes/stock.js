const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stockController");

router.get("/stats", stockController.getStockStats);
router.get("/", stockController.listStocks);
router.get("/:id", stockController.getStock);
router.post("/", stockController.createStock);
router.put("/:id", stockController.updateStock);
router.delete("/:id", stockController.deleteStock);

module.exports = router;
