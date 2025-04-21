const express = require("express");
const router = express.Router();
const products = require("../Models/Products");

// Insert product
router.post("/insertproduct", async (req, res) => {
  const {
    ProductId,
    ProductName,
    ProductPrice,
    ProductDiscount,
    ProductAvailability,
    ProductDescription
  } = req.body;

  if (!ProductId || !ProductName || !ProductPrice || !ProductDiscount || !ProductAvailability || !ProductDescription) {
    return res.status(400).json("All fields are required.");
  }

  try {
    const duplicate = await products.findOne({ ProductId });
    if (duplicate) {
      return res.status(422).json("ProductId already exists.");
    }

    const newProduct = new products({
      ProductId,
      ProductName,
      ProductPrice: Number(ProductPrice),
      ProductDiscount: Number(ProductDiscount),
      ProductAvailability: Number(ProductAvailability),
      ProductDescription
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json("Internal server error.");
  }
});

// Get all products
router.get("/products", async (req, res) => {
  try {
    const allProducts = await products.find({});
    res.status(201).json(allProducts);
  } catch (err) {
    console.error(err);
  }
});

// Get one product
router.get("/products/:id", async (req, res) => {
  try {
    const product = await products.findById(req.params.id);
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
  }
});

// Update product
router.put("/updateproduct/:id", async (req, res) => {
    const {
      ProductId,
      ProductName,
      ProductPrice,
      ProductDiscount,
      ProductAvailability,
      ProductDescription
    } = req.body;
  
    try {
      const current = await products.findById(req.params.id);
      if (!current) return res.status(404).json("Product not found");
  
      const existing = await products.findOne({ ProductId });
  
      if (existing && existing._id.toString() !== req.params.id) {
        return res.status(422).json("ProductId already exists.");
      }
  
      const updated = await products.findByIdAndUpdate(
        req.params.id,
        {
          ProductId,
          ProductName,
          ProductPrice: Number(ProductPrice),
          ProductDiscount: Number(ProductDiscount),
          ProductAvailability: Number(ProductAvailability),
          ProductDescription
        },
        { new: true }
      );
      res.status(201).json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json("Error updating product");
    }
  });
  
// Delete product
router.delete("/deleteproduct/:id", async (req, res) => {
  try {
    const deleted = await products.findByIdAndDelete(req.params.id);
    res.status(201).json(deleted);
  } catch (err) {
    console.error(err);
  }
});

// Update availability only
router.patch("/updateavailability/:id", async (req, res) => {
  try {
    const { ProductAvailability } = req.body;

    const updated = await products.findByIdAndUpdate(
      req.params.id,
      { ProductAvailability },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Not found" });
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating availability" });
  }
});

module.exports = router;
