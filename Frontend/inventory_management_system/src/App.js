import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Products from "./pages/Products";
import InsertProduct from "./pages/InsertProduct";
import UpdateProduct from "./pages/UpdateProduct";
import Home from "./pages/Home";
import Customers from "./pages/Customers";
import Sales from "./pages/Sales";
import CallLog from "./pages/CallLog";
import SalesAgent from "./pages/SalesAgent";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="main-content">
      <div className="d-flex">
        {/* Sidebar for all screen sizes */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="flex-grow-1">
          <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="p-3">
            <ToastContainer />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/insertproduct" element={<InsertProduct />} />
              <Route path="/updateproduct/:id" element={<UpdateProduct />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/call-log" element={<CallLog />} />
              <Route path="/sales-agent" element={<SalesAgent />} />
            </Routes>
          </div>
        </div>
      </div>
      </div>
    </Router>
  );
}
