import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(Tooltip, Legend, ArcElement);

export default function CallSummaryChart({ data }) {
  const total = data.positive + data.negative + data.neutral;

  const chartData = {
    labels: ["Positive", "Negative", "Neutral"],
    datasets: [
      {
        label: "Call Outcomes",
        data: [data.positive, data.negative, data.neutral],
        backgroundColor: [
          "rgba(75, 192, 192, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(255, 205, 86, 0.8)",
        ],
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 12,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#444",
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div
      className="shadow rounded p-4"
      style={{
        maxWidth: "400px",
        margin: "auto",
        background: "linear-gradient(145deg, #f4f4f4, #fff)",
        boxShadow: "5px 5px 15px rgba(0,0,0,0.1), -5px -5px 15px rgba(255,255,255,0.5)",
        borderRadius: "20px",
        transition: "transform 0.3s ease",
        transform: "perspective(1000px)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <h4 className="text-center mb-4">Conversions</h4>
      <Pie data={chartData} options={options} />
    </div>
  );
}
