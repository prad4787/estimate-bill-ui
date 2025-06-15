const { Sequelize } = require("sequelize");
const { AppConfig } = require("../config");

const sequelize = new Sequelize({
  dialect: AppConfig.DB.DIALECT,
  storage: AppConfig.DB.DB_PATH,
});

console.log({
  AppConfig,
});

// Import all models
const ClientModel = require("./client")(sequelize);
const UserModel = require("./user")(sequelize);
const JournalEntryModel = require("./journalEntry")(sequelize);
const StockModel = require("./stock")(sequelize);
const OrganizationModel = require("./organization")(sequelize);
const OrganizationContactModel = require("./organizationContact")(sequelize);
const PaymentMethodModel = require("./paymentMethod")(sequelize);

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

// Payment Method associations with Journal Entry
PaymentMethodModel.hasMany(JournalEntryModel, {
  foreignKey: "paymentMethodId",
  as: "journalEntries",
});
JournalEntryModel.belongsTo(PaymentMethodModel, {
  foreignKey: "paymentMethodId",
  as: "paymentMethod",
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

// Seed default payment methods
async function seedDefaultPaymentMethods() {
  try {
    const defaultMethods = [
      {
        type: "cash",
        isDefault: true,
        balance: 0,
      },
      {
        type: "cheque",
        isDefault: true,
      },
    ];

    for (const method of defaultMethods) {
      await PaymentMethodModel.findOrCreate({
        where: { type: method.type, isDefault: true },
        defaults: method,
      });
    }
    console.log("Default payment methods seeded successfully");
  } catch (error) {
    console.error("Error seeding default payment methods:", error);
    throw error;
  }
}

// Initialize database
const initDatabase = async () => {
  try {
    await sequelize.sync();
    await seedAdmin();
    await seedOrganization();
    await seedDefaultPaymentMethods();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

// Export models and initialization function
module.exports = {
  sequelize,
  initDatabase,
  ClientModel,
  UserModel,
  JournalEntryModel,
  StockModel,
  OrganizationModel,
  OrganizationContactModel,
  PaymentMethodModel,
};
