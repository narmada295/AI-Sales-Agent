import React, { useEffect, useState } from "react";

export default function PerformanceMetrics() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const res = await fetch("http://localhost:3001/api/performance-metrics");
      const data = await res.json();
      setMetrics(data);
    };
    fetchMetrics();
  }, []);

  if (!metrics) return <p>Loading performance metrics...</p>;

  const cardStyle = {
    background: "linear-gradient(145deg, #f4f4f4, #fff)",
    boxShadow: "5px 5px 15px rgba(0,0,0,0.1), -5px -5px 15px rgba(255,255,255,0.5)",
    borderRadius: "20px",
    transition: "transform 0.2s ease",
  };

  const handleHover = (e, scale) => {
    e.currentTarget.style.transform = `scale(${scale})`;
  };

  return (
    <div className="d-flex flex-column align-items-center gap-3">
      {[
        { label: "Average Acceptance Rate", value: `${metrics.averageAcceptanceRate}%`, color: "text-primary" },
        { label: "Total Sales", value: metrics.totalSales, color: "text-success" },
        { label: "Total Revenue", value: `₹${metrics.totalRevenue}`, color: "text-warning" },
        { label: "Success Rate", value: `${metrics.successRate}%`, color: "text-info" },
      ].map((item, i) => (
        <div
          key={i}
          className={`p-3 text-center w-100 ${item.color}`}
          style={cardStyle}
          onMouseEnter={(e) => handleHover(e, 1.03)}
          onMouseLeave={(e) => handleHover(e, 1)}
        >
          <h6 className="fw-semibold text-dark mb-2" style={{ fontSize: "14px" }}>{item.label}</h6>
          <div className="fs-4 fw-bold">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
