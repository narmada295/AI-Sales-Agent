const express = require("express");
const router = express.Router();
const Customer = require("../Models/Customer");

// Get all customers
// router.get("/", async (req, res) => {
//   try {
//     const customers = await Customer.find();
//     res.status(201).json(customers);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


router.get("/", async (req, res) => {
    try {
      const customers = await Customer.find();
      console.log("📦 Fetched Customers from MongoDB:", customers); // ✅ log to console
      res.status(201).json(customers);
    } catch (err) {
      console.error("❌ Error fetching customers:", err);
      res.status(500).json({ message: err.message });
    }
  });
  
module.exports = router;
