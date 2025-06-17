const organizationService = require("../services/organizationService");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
}).single("logo");

exports.getOrganization = async (req, res, next) => {
  try {
    const organization = await organizationService.getOrganization();
    if (!organization) {
      return res.apiError("Organization not found", 404);
    }
    res.apiSuccess(organization);
  } catch (err) {
    next(err);
  }
};

exports.updateOrganization = async (req, res, next) => {
  try {
    const {
      name,
      address,
      website,
      taxId,
      registrationNumber,
      phones,
      emails,
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.apiValidationError(["Name is required"]);
    }

    const organization = await organizationService.updateOrganization({
      name,
      address,
      website,
      taxId,
      registrationNumber,
      phones,
      emails,
    });

    if (!organization) {
      return res.apiError("Organization not found");
    }

    res.apiSuccess(organization);
  } catch (err) {
    next(err);
  }
};

exports.uploadLogo = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.apiError("Logo file size must be less than 5MB", 400);
        }
      }
      return res.apiError(err.message, 400);
    }

    if (!req.file) {
      return res.apiError("No file uploaded", 400);
    }

    try {
      const logoUrl = await organizationService.uploadLogo(req.file);
      if (!logoUrl) {
        return res.apiError("Organization not found", 404);
      }
      res.apiSuccess({ logoUrl }, "Logo uploaded successfully");
    } catch (err) {
      next(err);
    }
  });
};

exports.deleteLogo = async (req, res, next) => {
  try {
    const deleted = await organizationService.deleteLogo();
    if (!deleted) {
      return res.apiError("Organization or logo not found", 404);
    }
    res.apiSuccess(null, "Logo deleted successfully");
  } catch (err) {
    next(err);
  }
};
