const {
  BillModel,
  BillItemModel,
  StockModel,
  ClientModel,
} = require("../models");
const { Op } = require("sequelize");

// Helper function to calculate totals
const calculateTotals = (items, discountType, discountValue) => {
  const subTotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount =
    discountType === "rate" ? (subTotal * discountValue) / 100 : discountValue;
  const total = subTotal - discountAmount;

  return { subTotal, discountAmount, total };
};

// Helper function to generate bill number
const generateBillNumber = async () => {
  const lastBill = await BillModel.findOne({
    order: [["createdAt", "DESC"]],
  });

  const currentYear = new Date().getFullYear();

  if (!lastBill) {
    return `BILL-${currentYear}-0001`;
  }

  // Parse the last bill number: BILL-YYYY-NNNN
  const parts = lastBill.number.split("-");
  if (parts.length !== 3) {
    // Fallback if format is unexpected
    return `BILL-${currentYear}-0001`;
  }

  const lastYear = parts[1];
  const lastSequence = parseInt(parts[2]);

  // If it's a new year, start from 1
  if (lastYear !== currentYear.toString()) {
    return `BILL-${currentYear}-0001`;
  }

  // Increment the sequence number
  const newSequence = lastSequence + 1;
  return `BILL-${currentYear}-${newSequence.toString().padStart(4, "0")}`;
};

exports.createBill = async (data) => {
  const { date, clientId, items, discountType, discountValue } = data;
  const { subTotal, discountAmount, total } = calculateTotals(
    items,
    discountType,
    discountValue
  );

  // Retry mechanism for bill number generation
  let bill;
  let retries = 0;
  const maxRetries = 3;

  while (retries < maxRetries) {
    try {
      const number = await generateBillNumber();
      const id = `bill_${Date.now()}_${retries}`;

      // Create the bill
      bill = await BillModel.create({
        id,
        number,
        date,
        clientId,
        subTotal,
        discountType,
        discountValue,
        discountAmount,
        total,
      });

      break; // Success, exit the retry loop
    } catch (err) {
      if (
        err.name === "SequelizeUniqueConstraintError" &&
        err.fields &&
        err.fields.includes("number")
      ) {
        retries++;
        if (retries >= maxRetries) {
          throw new Error(
            "Failed to generate unique bill number after multiple attempts"
          );
        }
        // Wait a bit before retrying
        await new Promise((resolve) => setTimeout(resolve, 100));
        continue;
      }
      throw err; // Re-throw non-unique constraint errors
    }
  }

  // Create bill items
  const billItems = await Promise.all(
    items.map(async (item) => {
      // Find or create stock item
      let stock = await StockModel.findOne({
        where: { name: item.item },
      });

      if (!stock) {
        stock = await StockModel.create({
          name: item.item,
          quantity: null,
          status: "untracked",
        });
      }

      return BillItemModel.create({
        billId: bill.id,
        stockId: stock.id,
        quantity: item.quantity,
        rate: item.rate,
        total: item.total,
      });
    })
  );

  return {
    ...bill.toJSON(),
    items: billItems,
  };
};

exports.getBill = async (id) => {
  return BillModel.findByPk(id, {
    include: [
      {
        model: ClientModel,
        as: "client",
        attributes: ["name", "address", "panVat"],
      },
      {
        model: BillItemModel,
        as: "items",
        include: [
          {
            model: StockModel,
            as: "stock",
            attributes: ["name"],
          },
        ],
      },
    ],
  });
};

exports.listBills = async ({ page = 1, limit = 10, search = "" }) => {
  const offset = (page - 1) * limit;
  const where = {};

  if (search) {
    where[Op.or] = [
      { number: { [Op.like]: `%${search}%` } },
      { "$client.name$": { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await BillModel.findAndCountAll({
    where,
    include: [
      {
        model: ClientModel,
        as: "client",
        attributes: ["name"],
      },
    ],
    order: [["createdAt", "DESC"]],
    offset: Number(offset),
    limit: Number(limit),
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
};
