import React, { useEffect, useState } from "react";
import CallSummaryChart from "../components/callSummaryChart";
import RevenueBarChart from "../components/RevenueBarChart";
import TopSellingBarChart from "../components/TopSelling";
import PerformanceMetrics from "../components/PerformanceMetrics";
import RevenueLineChart from "../components/RevenueLineChart";
import CallSalesLineChart from "../components/CallSalesLineChart";

export default function Home() {
  const [summaryData, setSummaryData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [topSellingData, setTopSellingData] = useState(null);
  const [revenueLineData, setRevenueLineData] = useState(null);
  const [callsSalesData, setCallsSalesData] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      const res = await fetch("http://localhost:3001/api/call-summary");
      const data = await res.json();
      setSummaryData(data);
    };

    const fetchRevenue = async () => {
      const res = await fetch("http://localhost:3001/api/revenue-summary");
      const data = await res.json();
      setRevenueData(data);
    };

    const fetchTopSelling = async () => {
      const res = await fetch("http://localhost:3001/api/top-selling-products");
      const data = await res.json();
      setTopSellingData(data);
    };

    const fetchRevenueLine = async () => {
      const res = await fetch("http://localhost:3001/api/monthly-revenue");
      const data = await res.json();
      setRevenueLineData(data);
    };

    const fetchCallsSales = async () => {
      const res = await fetch("http://localhost:3001/api/monthly-calls-sales");
      const data = await res.json();
      setCallsSalesData(data);
    };

    fetchSummary();
    fetchRevenue();
    fetchTopSelling();
    fetchRevenueLine();
    fetchCallsSales();
  }, []);

  return (
    <div className="container-fluid p-4">
      {/*  Top Section: Pie + Metrics */}
      <div className="row g-4 mb-4 align-items-start">
        <div className="col-md-6">
          {summaryData ? (
            <CallSummaryChart data={summaryData} />
          ) : (
            <p>Loading call summary...</p>
          )}
        </div>
        <div className="col-md-6">
          <PerformanceMetrics />
        </div>
      </div>

      {/*  Middle Section: 2 Bar Charts Side by Side */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          {revenueData ? (
            <RevenueBarChart data={revenueData} />
          ) : (
            <p>Loading revenue chart...</p>
          )}
        </div>
        <div className="col-md-6">
          {topSellingData ? (
            <TopSellingBarChart data={topSellingData} />
          ) : (
            <p>Loading top sellers...</p>
          )}
        </div>
      </div>

      {/*  Bottom Section: Line Graphs */}
      <div className="row g-4">
        <div className="col-md-6">
          {revenueLineData && <RevenueLineChart data={revenueLineData} />}
        </div>
        <div className="col-md-6">
          {callsSalesData && <CallSalesLineChart data={callsSalesData} />}
        </div>
      </div>
    </div>
  );
}
