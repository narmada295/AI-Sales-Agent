const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { exec } = require("child_process");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

// === Connect to MongoDB ===
mongoose.connect("mongodb://localhost:27017/IMS", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected"));

// === Load Routes ===
const routes = require("./Routes/routes");
app.use("/", routes);

const callSummaryRoute = require("./Routes/callSummaryRoute");
app.use("/", callSummaryRoute);

const revenueSummaryRoute = require("./Routes/revenueSummary");
app.use("/", revenueSummaryRoute);

const performanceRoute = require("./Routes/performanceMetrics");
app.use("/", performanceRoute);

const monthlyRevenueRoute = require("./Routes/monthlyRevenueRoute");
app.use("/", monthlyRevenueRoute);

const monthlyCallsAndSalesRoute = require("./Routes/monthlyCnS");
app.use("/", monthlyCallsAndSalesRoute);

const topSellingRoute = require("./Routes/topSellingProducts");
app.use("/", topSellingRoute);

// === Trigger FastAPI from React ===
app.post("/sales-agent", async (req, res) => {
  const { numberOfCalls } = req.body;

  try {
    const response = await fetch("http://localhost:8000/start_bulk_calls", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ num_calls: numberOfCalls }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error(" Error triggering Python agent:", err);
    res.status(500).json({ error: "Failed to trigger sales agent." });
  }
});

// === Start Express Server ===
app.listen(3001, () => {
  console.log(" Server running on http://localhost:3001");
});
