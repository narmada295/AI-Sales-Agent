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

export default function TopSellingBarChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: "Units Sold",
        data: data.map((d) => d.count),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
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
          label: (context) => `Sold: ${context.formattedValue} units`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div
      className="bg-white p-4 rounded shadow-sm mx-auto"
      style={{
        maxWidth: "400px",
        transition: "transform 0.3s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <h5 className="text-center mb-4 fw-semibold text-secondary">
        Top Selling Products
      </h5>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}
