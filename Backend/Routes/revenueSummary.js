const express = require("express");
const router = express.Router();
const Sales = require("../Models/Sales");
const Products = require("../Models/Products");

router.get("/api/revenue-summary", async (req, res) => {
  try {
    const revenueData = await Sales.aggregate([
      {
        $group: {
          _id: "$ProductId",
          totalRevenue: { $sum: "$SellingPrice" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "products", 
          localField: "_id",       // _id from sales aggregation (ProductId)
          foreignField: "ProductId", // match against this field in products
          as: "productDetails"
        }
      },
      {
        $unwind: "$productDetails"
      },
      {
        $project: {
          _id: 0,
          ProductName: "$productDetails.ProductName",
          totalRevenue: 1
        }
      }
    ]);

    res.json(revenueData);
  } catch (err) {
    console.error("❌ Error fetching revenue summary:", err);
    res.status(500).json({ error: "Server error while fetching revenue summary" });
  }
});

module.exports = router;
