function success(data = null, message = "Success", status = 200) {
  return {
    success: true,
    message,
    data,
    status,
  };
}

function paginated(
  data = [],
  pagination = {},
  message = "Success",
  status = 200
) {
  return {
    success: true,
    message,
    data,
    pagination,
    status,
  };
}

function error(message = "Error", status = 500, errors = null) {
  return {
    success: false,
    message,
    errors,
    status,
  };
}

function validationError(errors, message = "Validation Error", status = 422) {
  return {
    success: false,
    message,
    errors,
    status,
  };
}

module.exports = {
  success,
  paginated,
  error,
  validationError,
};
