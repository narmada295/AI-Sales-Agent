import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Inject style to shift content on large screens */}
      <style>
        {`
          @media (min-width: 992px) {
            .main-content {
              margin-left: 250px;
            }
          }
        `}
      </style>

      {/* Backdrop for small screens */}
      <div
        className={`d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 ${
          isOpen ? "d-block" : "d-none"
        }`}
        style={{ zIndex: 1040 }}
        onClick={onClose}
      ></div>

      {/* Sidebar for large screens */}
      <div
        className="d-none d-lg-block bg-light position-fixed top-0 start-0 p-3"
        style={{
          width: "250px",
          height: "100vh",
          zIndex: 1041,
          overflowY: "auto",
        }}
      >
        <h5 className="text-primary fw-bold mb-4">Dashboard</h5>
        <ul className="nav flex-column">
          {["/", "/products", "/customers", "/sales", "/call-log", "/sales-agent"].map((path, idx) => (
            <li className="nav-item" key={idx}>
              <NavLink to={path} className="nav-link">
                {path === "/" ? "Statistics" : path.slice(1).replace("-", " ").replace(/^\w/, c => c.toUpperCase())}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Sidebar for small screens (slide-in) */}
      <div
        className="d-lg-none bg-light position-fixed top-0 start-0 height-100vh"
        style={{
          width: "250px",
          height: "100vh",
          zIndex: 1042,
          transition: "transform 0.3s ease",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1rem",
          }}
        >
          <h5 className="text-primary fw-bold mb-4">Inventory</h5>
          <ul className="nav flex-column">
            {["/", "/products", "/customers", "/sales", "/callLog", "/sales-agent"].map((path, idx) => (
              <li className="nav-item" key={idx}>
                <NavLink to={path} className="nav-link" onClick={onClose}>
                  {path === "/" ? "Statistics" : path.slice(1).replace("-", " ").replace(/^\w/, c => c.toUpperCase())}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
