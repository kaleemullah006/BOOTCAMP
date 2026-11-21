
const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Counter = require("../models/Counter");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();

const STATUSES = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

async function nextOrderNumber() {
  const counter = await Counter.findOneAndUpdate(
    { _id: "order" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return `AF-${1000 + counter.seq}`;
}

async function restoreStock(list) {
  for (const { productId, qty } of list) {
    await Product.updateOne(
      { _id: productId },
      { $inc: { stock: qty } }
    );
  }
}

function isValidPakistaniPhone(phone) {
  const cleaned = phone.replace(/[\s-]/g, "");
  return /^(?:\+92|92|0)?3\d{9}$/.test(cleaned);
}

/* ---------- PUBLIC: PLACE ORDER ---------- */

// POST /api/orders
router.post("/", async (req, res) => {
  const reserved = [];

  try {
    const { items, customer } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const c = customer || {};

    const name = String(c.name || "").trim();
    const phone = String(c.phone || "").trim();
    const city = String(c.city || "").trim();
    const address = String(c.address || "").trim();
    const note = String(c.note || "").trim();

    if (!name || !phone || !city || !address) {
      return res.status(400).json({
        message: "Name, phone, city and address are required",
      });
    }

    if (name.length > 100 || city.length > 80 || address.length > 500) {
      return res.status(400).json({
        message: "Please check the length of your details",
      });
    }

    if (!isValidPakistaniPhone(phone)) {
      return res.status(400).json({
        message: "Please enter a valid Pakistani mobile number",
      });
    }

    // Merge duplicate product IDs and validate quantities.
    const qtyMap = new Map();

    for (const item of items) {
      if (!item || !mongoose.isValidObjectId(item.productId)) {
        return res.status(400).json({
          message: "Invalid product in cart",
        });
      }

      const qty = Number(item.qty);

      if (!Number.isInteger(qty) || qty < 1) {
        return res.status(400).json({
          message: "Invalid product quantity",
        });
      }

      const productId = String(item.productId);
      const combinedQty = (qtyMap.get(productId) || 0) + qty;

      if (combinedQty > 20) {
        return res.status(400).json({
          message: "Maximum quantity per product is 20",
        });
      }

      qtyMap.set(productId, combinedQty);
    }

    const orderItems = [];
    let total = 0;

    for (const [productId, qty] of qtyMap) {
      // Atomic stock reduction. Client prices and names are ignored.
      const product = await Product.findOneAndUpdate(
        {
          _id: productId,
          isActive: true,
          stock: { $gte: qty },
        },
        {
          $inc: { stock: -qty },
        },
        {
          new: true,
        }
      );

      if (!product) {
        await restoreStock(reserved);

        const existingProduct = await Product.findById(productId);
        const productName = existingProduct
          ? existingProduct.name
          : "A product";

        return res.status(400).json({
          message: `Not enough stock available for "${productName}"`,
        });
      }

      reserved.push({ productId, qty });

      const price = Number(
        product.discountPrice ?? product.price
      );

      total += price * qty;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price,
        qty,
        image: product.images?.[0]?.url || "",
      });
    }

    const order = await Order.create({
      orderNumber: await nextOrderNumber(),
      items: orderItems,
      customer: {
        name,
        phone,
        city,
        address,
        note,
      },
      total,
      paymentMethod: "COD",
    });

    // Stock has been reduced and order successfully saved.
    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    // Restore stock if order creation or another step fails.
    try {
      await restoreStock(reserved);
    } catch (restoreError) {
      console.error("Stock restoration failed:", restoreError);
    }

    console.error("Place order error:", error);

    res.status(500).json({
      message: "Unable to place your order. Please try again.",
    });
  }
});

/* ---------- ADMIN ---------- */

// GET /api/orders/admin/all?status=Pending
router.get("/admin/all", adminOnly, async (req, res) => {
  try {
    const filter = {};

    if (req.query.status && STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/admin/:id
router.get("/admin/:id", adminOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/orders/:id/status
router.patch("/:id/status", adminOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const { status } = req.body || {};

    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({
        message: "Cancelled order cannot be changed",
      });
    }

    if (status === "Cancelled") {
      await restoreStock(
        order.items.map((item) => ({
          productId: item.productId,
          qty: item.qty,
        }))
      );
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;
