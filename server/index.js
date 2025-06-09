require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const apiResponse = require("./utils/apiResponse");
const indexRoutes = require("./routes");
const cors = require("cors");

// Serve static files from React build
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

app.use(cors());
// parse json
app.use(express.json());

// db init
const { initDatabase } = require("./models");
const { AppConfig } = require("./config");
initDatabase().then(() => {
  console.log("Database synced");
});

// Attach apiResponse helpers to res
app.use((req, res, next) => {
  res.apiSuccess = (data, message = "Success", status = 200) =>
    res.status(status).json(apiResponse.success(data, message, status));
  res.apiPaginated = (data, pagination, message = "Success", status = 200) =>
    res
      .status(status)
      .json(apiResponse.paginated(data, pagination, message, status));
  res.apiError = (message = "Error", status = 500, errors = null) =>
    res.status(status).json(apiResponse.error(message, status, errors));
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

// for all route return index.html

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.use("/api", indexRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(AppConfig.PORT, () => {
  console.log(`Server is running on port ${AppConfig.PORT}`);
});
