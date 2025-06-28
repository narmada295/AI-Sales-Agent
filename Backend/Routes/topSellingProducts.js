const express = require("express");
const router = express.Router();
const Sales = require("../Models/Sales");
const Products = require("../Models/Products");

router.get("/api/top-selling-products", async (req, res) => {
  try {
    const aggregated = await Sales.aggregate([
      {
        $group: {
          _id: "$ProductId",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Find max count to include all top entries with same count
    const maxCount = aggregated[0]?.count || 0;
    const topEntries = aggregated.filter((e) => e.count === maxCount)
      .concat(aggregated.filter((e) => e.count < maxCount).slice(0, 3 - aggregated.filter((e) => e.count === maxCount).length));

    // Map product names from Products table
    const result = await Promise.all(
      topEntries.map(async ({ _id, count }) => {
        const product = await Products.findOne({ ProductId: _id.toString() }); // Ensure type match
        return {
          name: product?.ProductName || `Product ${_id}`,
          count,
        };
      })
    );

    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching top-selling products:", err);
    res.status(500).json({ error: "Failed to fetch top-selling products." });
  }
});

module.exports = router;
