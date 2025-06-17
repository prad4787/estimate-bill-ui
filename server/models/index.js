const { Sequelize } = require("sequelize");
const { AppConfig } = require("../config");

const sequelize = new Sequelize({
  dialect: AppConfig.DB.DIALECT,
  storage: AppConfig.DB.DB_PATH,
  logging: false,
});

// Import all models
const ClientModel = require("./client")(sequelize);
const UserModel = require("./user")(sequelize);
const JournalEntryModel = require("./journalEntry")(sequelize);
const StockModel = require("./stock")(sequelize);
const OrganizationModel = require("./organization")(sequelize);
const OrganizationContactModel = require("./organizationContact")(sequelize);
const PaymentMethodModel = require("./paymentMethod")(sequelize);
const ReceiptModel = require("./receipt")(sequelize);
const TransactionModel = require("./transaction")(sequelize);
const BillModel = require("./bill")(sequelize);
const BillItemModel = require("./billItem")(sequelize);
const EstimateModel = require("./estimateModel")(sequelize);

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

// Receipt associations
ClientModel.hasMany(ReceiptModel, {
  foreignKey: "clientId",
  as: "receipts",
});
ReceiptModel.belongsTo(ClientModel, {
  foreignKey: "clientId",
  as: "client",
});

ReceiptModel.hasMany(TransactionModel, {
  foreignKey: "receiptId",
  as: "transactions",
});
TransactionModel.belongsTo(ReceiptModel, {
  foreignKey: "receiptId",
  as: "receipt",
});

// Bill associations
ClientModel.hasMany(BillModel, {
  foreignKey: "clientId",
  as: "bills",
});
BillModel.belongsTo(ClientModel, {
  foreignKey: "clientId",
  as: "client",
});

// BillItem associations
BillModel.hasMany(BillItemModel, {
  foreignKey: "billId",
  as: "items",
});
BillItemModel.belongsTo(BillModel, {
  foreignKey: "billId",
  as: "bill",
});

StockModel.hasMany(BillItemModel, {
  foreignKey: "stockId",
  as: "billItems",
});
BillItemModel.belongsTo(StockModel, {
  foreignKey: "stockId",
  as: "stock",
});

// Transaction associations
TransactionModel.belongsTo(PaymentMethodModel, {
  foreignKey: "paymentMethodId",
  as: "paymentMethod",
});

// Estimate associations
ClientModel.hasMany(EstimateModel, {
  foreignKey: "clientId",
  as: "estimates",
});

EstimateModel.belongsTo(ClientModel, {
  foreignKey: "clientId",
  as: "client",
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
      name: "",
      address: "",
    });

    // Create default contacts
    // await OrganizationContactModel.bulkCreate([
    //   {
    //     organizationId: org.id,
    //     type: "phone",
    //     value: "+1 (555) 123-4567",
    //     isPrimary: true,
    //   },
    //   {
    //     organizationId: org.id,
    //     type: "email",
    //     value: "info@yourcompany.com",
    //     isPrimary: true,
    //   },
    // ]);

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
    // First sync without force to check if tables exist
    await sequelize.sync({
      // force: true,
    });

    // Seed in correct order
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
  ReceiptModel,
  TransactionModel,
  BillModel,
  BillItemModel,
  EstimateModel,
};
