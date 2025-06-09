function isNumeric(value) {
  return !isNaN(value) && value !== "" && value !== null;
}

function validateClientInput(data) {
  const errors = {};

  if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
    errors.name = "Name is required";
  }

  if (data.panVat !== undefined && data.panVat !== null && data.panVat !== "") {
    if (!isNumeric(data.panVat)) {
      errors.panVat = "PAN/VAT must be a number";
    }
  }

  if (
    data.openingBalance !== undefined &&
    data.openingBalance !== null &&
    data.openingBalance !== ""
  ) {
    if (!isNumeric(data.openingBalance)) {
      errors.openingBalance = "Opening balance must be a number";
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

module.exports = {
  validateClientInput,
};
