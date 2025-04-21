import React, { useState } from "react";
import { BsTelephoneOutboundFill, BsArrowClockwise } from "react-icons/bs";
import "bootstrap/dist/css/bootstrap.min.css";

export default function SalesAgent() {
  const [numCalls, setNumCalls] = useState(1);
  const [status, setStatus] = useState("");
  const [currentCalls, setCurrentCalls] = useState([]);
  const [completed, setCompleted] = useState(false);

  const handleStartCalling = async () => {
    try {
      setStatus("📞 Starting calls...");
      setCurrentCalls([]);
      setCompleted(false);

      const response = await fetch("http://localhost:3001/sales-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numberOfCalls: numCalls }),
      });

      const data = await response.json();

      if (response.status === 200) {
        setStatus("✅ Calls initiated successfully.");
        setCurrentCalls(data.called_customers || []);
        setCompleted(true);
      } else {
        setStatus(`❌ Error: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Network error while initiating calls.");
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="container p-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="card-title mb-4 text-primary">📞 Sales Agent Caller</h3>

          <p className="fw-semibold">Enter the number of calls you want to make:</p>
          <div className="d-flex gap-3 align-items-center mb-3">
            <input
              type="number"
              min="1"
              className="form-control w-25"
              value={numCalls}
              onChange={(e) => setNumCalls(e.target.value)}
            />
            <button className="btn btn-success d-flex align-items-center gap-2" onClick={handleStartCalling}>
              <BsTelephoneOutboundFill /> Start Calling
            </button>
            <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={handleRefresh}>
              <BsArrowClockwise /> Refresh
            </button>
          </div>

          {status && (
            <div className={`alert ${status.startsWith("✅") ? "alert-success" : "alert-info"}`} role="alert">
              {status}
            </div>
          )}

          {currentCalls.length > 0 && (
            <div className="mt-4">
              <h5 className="mb-3">📋 Calls being made to:</h5>
              <ul className="list-group">
                {currentCalls.map((cust, index) => (
                  <li key={index} className="list-group-item">
                    👤 <strong>{cust.name}</strong> - 📱 {cust.phone}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
