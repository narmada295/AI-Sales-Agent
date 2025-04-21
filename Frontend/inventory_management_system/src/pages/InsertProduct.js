import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function InsertProduct() {
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDiscount, setProductDiscount] = useState("");
  const [productAvailability, setProductAvailability] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addProduct = async (e) => {
    e.preventDefault();

    if (!productId || !productName || !productPrice || !productDiscount || !productAvailability || !productDescription) {
      toast.error("Please fill in all the required fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/insertproduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ProductId: productId,
          ProductName: productName,
          ProductPrice: productPrice,
          ProductDiscount: productDiscount,
          ProductAvailability: productAvailability,
          ProductDescription: productDescription
        }),
      });

      await res.json();

      if (res.status === 201) {
        toast.success("✅ Product Added Successfully!");
        navigate("/products");
      } else if (res.status === 422) {
        toast.error("❌ Product ID already exists.");
      } else {
        toast.error("❌ Something went wrong.");
      }
    } catch (err) {
      toast.error("❌ Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Add New Product</h2>
      <form onSubmit={addProduct}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Product ID</label>
            <input type="number" value={productId} onChange={(e) => setProductId(e.target.value)} className="form-control" />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Product Name</label>
            <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} className="form-control" />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Product Price</label>
            <input type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} className="form-control" />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Product Discount (%)</label>
            <input type="number" value={productDiscount} onChange={(e) => setProductDiscount(e.target.value)} className="form-control" />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Product Availability</label>
            <input type="number" value={productAvailability} onChange={(e) => setProductAvailability(e.target.value)} className="form-control" />
          </div>

          <div className="col-12 mb-3">
            <label className="form-label">Product Description</label>
            <textarea value={productDescription} onChange={(e) => setProductDescription(e.target.value)} className="form-control" />
          </div>

          <div className="d-flex gap-3">
            <NavLink to="/products" className="btn btn-secondary">Cancel</NavLink>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Adding..." : "Add Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
