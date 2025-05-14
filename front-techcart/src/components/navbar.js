import React from 'react';
import { Container, Navbar } from 'react-bootstrap';
import { FaShoppingCart } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../axiosClient';
import { useCart } from '../context/CartContext';

const NavbarComponent = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();

  const totalItems = cartItems.reduce((total, item) => total + item.qty, 0);

  const handleLogout = async () => {
    try {
      await axiosClient.post('/logout');
    } catch (error) {
      console.error('Logout error:', error.response?.status, error.response?.data);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <Navbar expand="lg" className="navbar-custom py-3">
      <Container fluid>
        <Link to="/" className="text-decoration-none">
          <Navbar.Brand className="brand-logo">
            <span className="pink-text">TechCart</span>
            <span className="black-text">‘n</span>
            <span className="orange-text"> Online PC Components Store</span>
          </Navbar.Brand>
        </Link>

        <div className="d-flex align-items-center ms-auto">
          <Link to="/cart" className="text-decoration-none ms-3 position-relative">
            <FaShoppingCart className="icon " />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="btn btn-link text-black text-decoration-none ms-3"
            style={{ textDecoration: 'none' }}
          >
            <span className="fs-6">Logout</span>
          </button>
        </div>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;