const { Sequelize } = require("sequelize");
const { AppConfig } = require("../config");

const sequelize = new Sequelize({
  dialect: AppConfig.DB.DIALECT,
  storage: AppConfig.DB.DB_PATH,
});

console.log({
  AppConfig,
});

// Sync database
const ClientModel = require("./client")(sequelize);
const UserModel = require("./user")(sequelize);

async function seedAdmin() {
  const count = await UserModel.count();
  if (count === 0) {
    await UserModel.create({
      email: AppConfig.ADMIN.EMAIL,
      password: AppConfig.ADMIN.PASSWORD,
      role: "admin",
    });
    console.log("Admin user seeded");
  }
}

module.exports = {
  //  init db function
  initDatabase: async () => {
    await sequelize.sync();
    await seedAdmin();
  },
  ClientModel,
  UserModel,
};
