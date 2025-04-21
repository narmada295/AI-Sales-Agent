import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function CallLog() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest"); // "latest" or "oldest"

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, outcomeFilter, sortOrder]);

  const fetchLogs = async () => {
    try {
      const res = await fetch("http://localhost:3001/calllog");
      const data = await res.json();
      if (res.status === 201) {
        setLogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch call logs:", err);
    }
  };

  const applyFilters = () => {
    let result = [...logs];

    if (outcomeFilter !== "all") {
      result = result.filter((log) => log.Outcome === outcomeFilter);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.TimeStamp);
      const dateB = new Date(b.TimeStamp);
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredLogs(result);
  };

  const handleView = (summary) => {
    setSelectedSummary(summary);
    setShowModal(true);
  };

  return (
    <div className="d-flex">
      <div className="flex-grow-1">
        <div className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Call Log</h2>
            <div className="d-flex gap-2 align-items-center">
              {/* 🔍 Outcome filter */}
              <select
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value)}
                className="form-select"
              >
                <option value="all">All</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
                <option value="neutral">Neutral</option>
              </select>

              {/*  Date sort */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="form-select"
              >
                <option value="latest">Sort by Latest</option>
                <option value="oldest">Sort by Oldest</option>
              </select>
            </div>
          </div>

          <div className="table-responsive shadow-sm rounded bg-white">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Call ID</th>
                  <th>Phone No</th>
                  <th>Outcome</th>
                  <th>Date</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log, index) => (
                    <tr key={log._id}>
                      <td>{index + 1}</td>
                      <td>{log.CallId}</td>
                      <td>{log.PHONENO}</td>
                      <td>{log.Outcome}</td>
                      <td>
  {log.TimeStamp
    ? (() => {
        const d = new Date(log.TimeStamp);
        const dateStr = d.toLocaleDateString("en-GB").replace(/\//g, "-");
        const timeStr = d.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        return `${dateStr} ${timeStr}`;
      })()
    : "N/A"}
</td>

                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleView(log.CallSummary)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No matching calls found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Modal for Summary */}
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Call Summary</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>{selectedSummary}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}
