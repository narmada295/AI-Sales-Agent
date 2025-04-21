const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  PHONENO: String,
  CUSTOMER_NAME: String,
  ACCEPTANCE_RATE: Number,
  TOTAL_CALLS_MADE: Number,
  InterestedProducts: [Number]
});

module.exports = mongoose.model("Customer", customerSchema, "customer");


