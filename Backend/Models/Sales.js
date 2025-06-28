const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  ProductId: {
    type: Number, 
    required: true
  },
  PHONENO: {
    type: String,
    required: true
  },
  SellingPrice: {
    type: Number,
    required: true
  },
  TimeStamp: {
    type: Date,
    default: Date.now 
  }
});

module.exports = mongoose.model("Sales", salesSchema, "sales");
