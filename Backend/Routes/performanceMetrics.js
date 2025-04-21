const express = require("express");
const router = express.Router();
const Customers = require("../Models/Customer");
const Sales = require("../Models/Sales");
const CallLog = require("../Models/CallLog");

router.get("/api/performance-metrics", async (req, res) => {
  try {
    // 1. Average Acceptance Rate (across all customers)
    const allCustomers = await Customers.find({});
    const avgAcceptanceRate =
      allCustomers.length > 0
        ? allCustomers.reduce((sum, c) => sum + c.ACCEPTANCE_RATE, 0) /
          allCustomers.length
        : 0;

    // 2. Total Sales
    const totalSales = await Sales.countDocuments();

    // 3. Total Revenue
    const revenueAgg = await Sales.aggregate([
      { $group: { _id: null, total: { $sum: "$SellingPrice" } } },
    ]);
    const totalRevenue =
      revenueAgg.length > 0 ? revenueAgg[0].total.toFixed(2) : 0;

    // 4. Success Rate = positive outcomes / total calls
    const totalCalls = await CallLog.countDocuments();
    const successfulCalls = await CallLog.countDocuments({
      Outcome: "positive",
    });
    const successRate =
      totalCalls > 0 ? ((successfulCalls / totalCalls) * 100).toFixed(2) : 0;

    res.json({
      averageAcceptanceRate: avgAcceptanceRate.toFixed(2),
      totalSales,
      totalRevenue,
      successRate,
    });
  } catch (err) {
    console.error("❌ Error computing metrics:", err);
    res.status(500).json({ error: "Failed to compute metrics." });
  }
});

module.exports = router;
