const express = require("express");
const router = express.Router();
const organizationController = require("../controllers/organizationController");

router.get("/", organizationController.getOrganization);
router.put("/", organizationController.updateOrganization);
router.post("/logo", organizationController.uploadLogo);
router.delete("/logo", organizationController.deleteLogo);

module.exports = router;
