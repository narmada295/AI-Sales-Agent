const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Ensure DB connection
let db;
client.connect()
  .then(() => {
    db = client.db("IMS");
    console.log("✅ Connected to MongoDB for Call Summary Route");
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
  });

// GET /api/call-summary
router.get("/api/call-summary", async (req, res) => {
  try {
    const callLog = db.collection("call_log");

    const summary = await callLog.aggregate([
      {
        $group: {
          _id: "$Outcome",
          count: { $sum: 1 },
        },
      },
    ]).toArray();

    const result = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    summary.forEach(item => {
      result[item._id] = item.count;
    });

    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching call summary:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
