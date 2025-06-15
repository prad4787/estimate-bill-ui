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
const JournalEntryModel = require("./journalEntry")(sequelize);
const StockModel = require("./stock")(sequelize);
const OrganizationModel = require("./organization")(sequelize);
const OrganizationContactModel = require("./organizationContact")(sequelize);

// Set up associations
ClientModel.hasMany(JournalEntryModel, {
  foreignKey: "clientId",
  as: "journalEntries",
});
JournalEntryModel.belongsTo(ClientModel, {
  foreignKey: "clientId",
  as: "client",
});

// Organization associations
OrganizationModel.hasMany(OrganizationContactModel, {
  foreignKey: "organizationId",
  as: "contacts",
});
OrganizationContactModel.belongsTo(OrganizationModel, {
  foreignKey: "organizationId",
  as: "organization",
});

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

// Seed default organization
async function seedOrganization() {
  const count = await OrganizationModel.count();
  if (count === 0) {
    const org = await OrganizationModel.create({
      name: "Your Company Name",
      address: "Your Company Address",
    });

    // Create default contacts
    await OrganizationContactModel.bulkCreate([
      {
        organizationId: org.id,
        type: "phone",
        value: "+1 (555) 123-4567",
        isPrimary: true,
      },
      {
        organizationId: org.id,
        type: "email",
        value: "info@yourcompany.com",
        isPrimary: true,
      },
    ]);

    console.log("Default organization seeded");
  }
}

module.exports = {
  //  init db function
  initDatabase: async () => {
    await sequelize.sync();
    await seedAdmin();
    await seedOrganization();
  },
  ClientModel,
  UserModel,
  JournalEntryModel,
  StockModel,
  OrganizationModel,
  OrganizationContactModel,
};
