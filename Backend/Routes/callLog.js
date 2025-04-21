const express = require("express");
const router = express.Router();
const CallLog = require("../Models/CallLog");

// Get all call logs
router.get("/", async (req, res) => {
  try {
    const logs = await CallLog.find();
    res.status(201).json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
