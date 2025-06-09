const authService = require("../services/authService");

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.apiValidationError(["email and password are required"]);
    }
    const user = await authService.login(email, password);
    if (!user) return res.apiError("Invalid credentials", 401);
    // For demo: return a simple token (in production, use JWT)
    const token = Buffer.from(`${user.id}:${user.email}:${user.role}`).toString(
      "base64"
    );
    res.apiSuccess(
      {
        token,
        user: { id: user.id, email: user.email, role: user.role },
      },
      "Login successful"
    );
  } catch (err) {
    next(err);
  }
};
