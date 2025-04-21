const express = require("express");
const router = express.Router();

const productRoutes = require("./products");
const customerRoutes = require("./customer");

// Mount product-related routes
router.use("/", productRoutes);

// Mount customer-related routes at /customers
router.use("/customers", customerRoutes);
const salesRoutes = require("./sales");
router.use("/sales", salesRoutes);
const callLogRoutes = require("./callLog");
router.use("/calllog", callLogRoutes);


module.exports = router;
