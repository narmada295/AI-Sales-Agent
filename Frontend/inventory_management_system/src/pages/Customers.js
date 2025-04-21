import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/customers")
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data);
        setFiltered(data);
      });
  }, []);

  const handleSearch = (query) => {
    const filteredList = customers.filter((cust) =>
      cust.CUSTOMER_NAME.toLowerCase().includes(query.toLowerCase())
    );
    setFiltered(filteredList);
  };

  return (
    <div className="d-flex">
   
      <div className="flex-grow-1">
    
        <div className="p-4">
          <h2 className="mb-4">Customers</h2>

          <div className="mb-3">
            <input
              type="text"
              placeholder="🔍 Search Customers"
              className="form-control w-50"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="table-responsive shadow-sm rounded bg-white">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Acceptance Rate</th>
                  <th>Total Calls</th>
                  <th>Interested Products</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((cust, i) => (
                    <tr key={cust._id}>
                      <td>{i + 1}</td>
                      <td>{cust.CUSTOMER_NAME}</td>
                      <td>{cust.PHONENO}</td>
                      <td>{cust.ACCEPTANCE_RATE.toFixed(2)}</td>
                      <td>{cust.TOTAL_CALLS_MADE}</td>
                      <td>{cust.InterestedProducts.join(", ")}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">No matching customers.</td>
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
