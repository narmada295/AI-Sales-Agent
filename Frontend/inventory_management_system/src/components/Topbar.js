import React from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import { FaBars } from "react-icons/fa";

export default function Topbar({ toggleSidebar }) {
  return (
    <Navbar bg="light" expand="lg" className="shadow-sm px-3">
      <Container fluid>
        <Navbar.Brand className="fw-bold text-primary">TECHVISTA</Navbar.Brand>
        <Button
          variant="outline-secondary"
          className="d-lg-none ms-auto"
          onClick={toggleSidebar}
        >
          <FaBars />
        </Button>
      </Container>
    </Navbar>
  );
}
