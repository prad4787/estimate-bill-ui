const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const { requireAuth } = require("../utils/auth");
const { validateClientRequest } = require("../utils/validate");

router.get("/", clientController.listClients);
router.get("/:id", clientController.getClient);
router.post("/", validateClientRequest, clientController.createClient);
router.put("/:id", validateClientRequest, clientController.updateClient);
router.delete("/:id", clientController.deleteClient);

module.exports = router;
