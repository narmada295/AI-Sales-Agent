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

export default function CallSalesLineChart({ data }) {
  const chartData = {
    labels: data.map((item) => item.month),
    datasets: [
      {
        label: "Calls",
        data: data.map((item) => item.calls),
        fill: false,
        borderColor: "#3498db",
        backgroundColor: "#3498db",
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Sales",
        data: data.map((item) => item.sales),
        fill: false,
        borderColor: "#2ecc71",
        backgroundColor: "#2ecc71",
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
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
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
        📊 Monthly Calls & Sales (Last 6 Months)
      </h5>
      <Line data={chartData} options={options} />
    </div>
  );
}
