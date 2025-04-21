const express = require("express");
const router = express.Router();
const Sales = require("../Models/Sales");
const CallLog = require("../Models/CallLog");

router.get("/api/monthly-calls-sales", async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const calls = await CallLog.aggregate([
      { $match: { TimeStamp: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$TimeStamp" },
            month: { $month: "$TimeStamp" }
          },
          totalCalls: { $sum: 1 }
        }
      }
    ]);

    const sales = await Sales.aggregate([
      { $match: { TimeStamp: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$TimeStamp" },
            month: { $month: "$TimeStamp" }
          },
          totalSales: { $sum: 1 }
        }
      }
    ]);

    const resultMap = new Map();

    calls.forEach(item => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
      resultMap.set(key, { month: key, calls: item.totalCalls, sales: 0 });
    });

    sales.forEach(item => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
      if (!resultMap.has(key)) {
        resultMap.set(key, { month: key, calls: 0, sales: item.totalSales });
      } else {
        resultMap.get(key).sales = item.totalSales;
      }
    });

    const result = Array.from(resultMap.values()).sort((a, b) => a.month.localeCompare(b.month));
    res.json(result);
  } catch (err) {
    console.error("❌ Error generating calls/sales chart:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;
