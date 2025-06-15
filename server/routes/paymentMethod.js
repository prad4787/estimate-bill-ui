const express = require("express");
const router = express.Router();
const paymentMethodController = require("../controllers/paymentMethodController");

// Apply authentication middleware to all routes

// List payment methods
router.get("/", paymentMethodController.listPaymentMethods);

// Get single payment method
router.get("/:id", paymentMethodController.getPaymentMethod);

// Create payment method
router.post("/", paymentMethodController.createPaymentMethod);

// Update payment method
router.put("/:id", paymentMethodController.updatePaymentMethod);

// Delete payment method
router.delete("/:id", paymentMethodController.deletePaymentMethod);

// Update payment method balance
router.patch("/:id/balance", paymentMethodController.updateBalance);

module.exports = router;
