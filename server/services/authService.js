const { UserModel } = require("../models");
const bcrypt = require("bcrypt");

exports.login = async (email, password) => {
  const user = await UserModel.findOne({ where: { email } });
  if (!user) return null;
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;
  return user;
};
