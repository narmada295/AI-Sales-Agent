import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import SearchBar from "../components/SearchBar";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("latest"); // "latest" or "oldest"

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, sortOrder, sales]);

  const fetchSales = async () => {
    try {
      const res = await fetch("http://localhost:3001/sales");
      const data = await res.json();
      if (res.status === 201) {
        setSales(data);
      }
    } catch (err) {
      console.error("Failed to fetch sales:", err);
    }
  };

  const applyFilters = () => {
    let result = [...sales];

    // 🔍 Filter by phone
    if (searchQuery) {
      result = result.filter((sale) =>
        sale.PHONENO.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 📅 Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.TimeStamp);
      const dateB = new Date(b.TimeStamp);
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredSales(result);
  };

  const handleSearch = (query) => setSearchQuery(query);
  const handleSortChange = (e) => setSortOrder(e.target.value);

  return (
    <div className="d-flex">
      <div className="flex-grow-1">
        <div className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Sales Records</h2>
          </div>

          {/* 🔍 Search + 📅 Sort Filter */}
          <div className="d-flex gap-3 mb-3 align-items-center">
            <SearchBar placeholder="Search by phone number..." onSearch={handleSearch} />
            <select className="form-select w-auto" onChange={handleSortChange} value={sortOrder}>
              <option value="latest">Sort by Latest</option>
              <option value="oldest">Sort by Oldest</option>
            </select>
          </div>

          <div className="table-responsive shadow-sm rounded bg-white mt-3">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Phone No</th>
                  <th>Product ID</th>
                  <th>Selling Price</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length > 0 ? (
                  filteredSales.map((sale, index) => (
                    <tr key={sale._id}>
                      <td>{index + 1}</td>
                      <td>{sale.PHONENO}</td>
                      <td>{sale.ProductId}</td>
                      <td>{sale.SellingPrice}</td>
                      <td>
  {sale.TimeStamp
    ? (() => {
        const d = new Date(sale.TimeStamp);
        const dateStr = d.toLocaleDateString("en-GB").replace(/\//g, "-");
        const timeStr = d.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        return `${dateStr} ${timeStr}`;
      })()
    : "N/A"}
</td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No matching sales found.
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
