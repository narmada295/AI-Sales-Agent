import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

export default function RevenueLineChart({ data }) {
  const chartData = {
    labels: data.map((item) => item.month),
    datasets: [
      {
        label: "Revenue (₹)",
        data: data.map((item) => item.revenue),
        fill: false,
        borderColor: "#8e44ad",
        backgroundColor: "#8e44ad",
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
            weight: "bold",
          },
          color: "#555",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `₹${context.formattedValue}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (val) => `₹${val.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div
      className="bg-white p-4 rounded shadow-sm"
      style={{
        maxWidth: "700px",
        margin: "auto",
        transition: "transform 0.3s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <h5 className="text-center mb-3 fw-semibold text-secondary">
        📈 Monthly Revenue (Last 6 Months)
      </h5>
      <Line data={chartData} options={options} />
    </div>
  );
}
