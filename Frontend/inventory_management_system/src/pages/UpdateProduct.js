import React, { useEffect, useState } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function UpdateProduct() {
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDiscount, setProductDiscount] = useState("");
  const [productAvailability, setProductAvailability] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getProduct = async () => {
      try {
        const res = await fetch(`http://localhost:3001/products/${id}`);
        const data = await res.json();
        if (res.status === 201) {
          setProductId(data.ProductId);
          setProductName(data.ProductName);
          setProductPrice(data.ProductPrice);
          setProductDiscount(data.ProductDiscount);
          setProductAvailability(data.ProductAvailability);
          setProductDescription(data.ProductDescription);
        } else {
          toast.error("❌ Failed to fetch product details.");
        }
      } catch (err) {
        toast.error("❌ Error fetching product.");
      }
    };
    getProduct();
  }, [id]);

  const updateProduct = async (e) => {
    e.preventDefault();

    if (!productId || !productName || !productPrice || !productDiscount || !productAvailability || !productDescription) {
      toast.error("Please fill in all the required fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:3001/updateproduct/${id}`, {
        method: "PUT",
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
        toast.success("✅ Product Updated Successfully!");
        navigate("/products");
      } else if (res.status === 422) {
        toast.error("❌ Product ID already exists.");
      } else {
        toast.error("❌ Update failed.");
      }
    } catch (err) {
      toast.error("❌ Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Update Product</h2>
      <form onSubmit={updateProduct}>
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
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
