import React from 'react';
import { Container, Navbar, Nav } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from '../axiosClient';
import "../components/navbar.css";

const NavbarComponent = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      await axiosClient.post('/logout');
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <Navbar expand="lg" className="navbar-custom py-3">
      <Container fluid>
        <Link to="/adminproducts" className="text-decoration-none">
          <Navbar.Brand className="brand-logo">
            <span className="pink-text">TechCart</span>
            <span className="black-text">‘n</span>
            <span className="orange-text"> Admin Panel</span>
          </Navbar.Brand>
        </Link>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/adminproducts" className="text-black">
              Manage Products
            </Nav.Link>
            <Nav.Link as={Link} to="/admintransactions" className="text-black">
              Transactions
            </Nav.Link>
            <Nav.Link onClick={handleLogout} className="text-black">
              Logout
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;
