const express = require("express");
const router = express.Router();
const Sales = require("../Models/Sales");

router.get("/api/monthly-revenue", async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const revenueData = await Sales.aggregate([
      { $match: { TimeStamp: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$TimeStamp" },
            month: { $month: "$TimeStamp" }
          },
          totalRevenue: { $sum: "$SellingPrice" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const formatted = revenueData.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      revenue: item.totalRevenue
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error generating monthly revenue data:", err);
    res.status(500).json({ error: "Failed to fetch revenue stats" });
  }
});

module.exports = router;
