require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const apiResponse = require("./utils/apiResponse");
const indexRoutes = require("./routes");
const cors = require("cors");
const receiptRoutes = require("./routes/receipts");
const estimateRoutes = require("./routes/estimate");

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// db init
const { initDatabase } = require("./models");
const { AppConfig } = require("./config");
initDatabase().then(() => {
  console.log("Database synced");
});

// Attach apiResponse helpers to res
app.use((req, res, next) => {
  res.apiSuccess = (data, status = 200) => {
    // Handle pagination data
    if (data && typeof data === "object" && "total" in data && "page" in data) {
      const { total, page, limit, totalPages, ...rest } = data;
      return res.status(status).json({
        success: true,
        data: rest,
        pagination: { total, page, limit, totalPages },
      });
    }

    // Handle data with message
    if (data && typeof data === "object" && "message" in data) {
      const { message, ...rest } = data;
      return res.status(status).json({
        success: true,
        message,
        data: Object.keys(rest).length > 0 ? rest : null,
      });
    }

    // Handle simple data
    return res.status(status).json({
      success: true,
      data,
    });
  };

  res.apiError = (message, status = 400) => {
    return res.status(status).json({
      success: false,
      error: message,
    });
  };

  res.apiPaginated = (data, pagination, message = "Success", status = 200) =>
    res
      .status(status)
      .json(apiResponse.paginated(data, pagination, message, status));

  res.apiValidationError = (
    errors,
    message = "Validation Error",
    status = 422
  ) =>
    res
      .status(status)
      .json(apiResponse.validationError(errors, message, status));

  next();
});

// Register API routes first
app.use("/api", indexRoutes);

// Global error handler
app.use((err, req, res, next) => {
  if (err.name === "SequelizeValidationError") {
    return res.apiValidationError(err.errors.map((e) => e.message));
  }
  res.apiError(
    err.message || "Internal Server Error",
    err.status || 500,
    err.errors || null
  );
});

// Serve static files from React build last
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

// Catch-all route to serve index.html for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
