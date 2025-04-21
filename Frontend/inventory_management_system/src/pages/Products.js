import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

export default function Products() {
  const [productData, setProductData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    getProducts();
  }, []);

  const getProducts = async () => {
    try {
      const res = await fetch("http://localhost:3001/products");
      const data = await res.json();
      if (res.status === 201) {
        setProductData(data);
        setFilteredData(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Error fetching products.");
    }
  };

  const handleSearch = (query) => {
    const filtered = productData.filter((item) =>
      item.ProductName.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const updateAvailability = async (id, newAvailability) => {
    if (newAvailability <= 0) return deleteProduct(id);
    try {
      const res = await fetch(`http://localhost:3001/updateavailability/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ProductAvailability: newAvailability }),
      });
      if (res.status === 200) {
        toast.success("✅ Availability updated");
        getProducts();
      } else {
        toast.error("❌ Failed to update availability.");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Server error during update.");
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/deleteproduct/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 201) {
        toast.success("🗑️ Product deleted");
        getProducts();
      } else {
        toast.error("❌ Failed to delete product.");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Server error during deletion.");
    }
  };

  return (
    <div className="d-flex flex-column flex-md-row">
      
      <div className="flex-grow-1">
       
        <div className="container-fluid p-3">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3">
            <h2 className="mb-2 mb-sm-0">Products Inventory</h2>
            <NavLink to="/insertproduct" className="btn btn-primary">
              + Add New Product
            </NavLink>
          </div>

          <div className="mb-3">
            <input
              type="text"
              placeholder="🔍 Search Products"
              className="form-control"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="table-responsive" style={{ overflowX: "auto" }}>
            <table className="table table-bordered table-hover align-middle text-nowrap">
              <thead className="table-light">
                <tr>
                  <th style={{ minWidth: "40px" }}>#</th>
                  <th style={{ minWidth: "120px" }}>Name</th>
                  <th style={{ minWidth: "100px" }}>Price (₹)</th>
                  <th style={{ minWidth: "100px" }}>Discount (%)</th>
                  <th style={{ minWidth: "140px" }}>Availability</th>
                  <th style={{ minWidth: "80px" }}>Edit</th>
                  <th style={{ minWidth: "90px" }}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((element, index) => (
                    <tr key={element._id}>
                      <td>{index + 1}</td>
                      <td style={{ wordBreak: "break-word" }}>{element.ProductName}</td>
                      <td>{element.ProductPrice}</td>
                      <td>{element.ProductDiscount}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <button
                            onClick={() => updateAvailability(element._id, element.ProductAvailability - 1)}
                            className="btn btn-sm btn-outline-secondary"
                          >
                            −
                          </button>
                          <span>{element.ProductAvailability}</span>
                          <button
                            onClick={() => updateAvailability(element._id, element.ProductAvailability + 1)}
                            className="btn btn-sm btn-outline-secondary"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td>
                        <NavLink
                          to={`/updateproduct/${element._id}`}
                          className="btn btn-sm btn-outline-primary text-nowrap"
                        >
                          Edit
                        </NavLink>
                      </td>
                      <td>
                        <button
                          onClick={() => deleteProduct(element._id)}
                          className="btn btn-sm btn-outline-danger text-nowrap"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      No matching products.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
