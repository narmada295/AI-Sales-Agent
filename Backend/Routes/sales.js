const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
  ProductId: Number,
  PHONENO: String,
  SellingPrice: Number
});

const Sale = mongoose.model("Sale", saleSchema, "sales");

// Get all sales
router.get("/", async (req, res) => {
  try {
    const sales = await Sale.find();
    res.status(201).json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
