import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function RevenueBarChart({ data }) {
  const chartData = {
    labels: data.map((item) => item.ProductName),
    datasets: [
      {
        label: "Total Revenue (₹)",
        data: data.map((item) => item.totalRevenue),
        backgroundColor: ["#36A2EB", "#4BC0C0", "#9966FF"],
        borderRadius: 8,
        hoverOffset: 10,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `₹ ${context.formattedValue}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${value}`,
        },
      },
    },
  };

  return (
    <div
      className="bg-white p-4 rounded shadow-sm mx-auto"
      style={{ maxWidth: "400px", transition: "transform 0.3s ease" }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <h5 className="text-center mb-4 fw-semibold text-secondary">
        Top 3 Revenue Products
      </h5>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}
