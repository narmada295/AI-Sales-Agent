const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  ProductId: { type: Number, required: true, unique: true }, 
  ProductName: { type: String, required: true },
  ProductPrice: { type: Number, required: true },
  ProductDiscount: { type: Number, required: true },
  ProductAvailability: { type: Number, required: true },
  ProductDescription: { type: String, required: true }
});

module.exports = mongoose.model("products", productSchema);




