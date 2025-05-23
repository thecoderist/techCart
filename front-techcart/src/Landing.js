import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Alert, Modal } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./context/CartContext";
import { useProduct } from "./context/ProductContext";
import "./App.css";
import Footer from "./components/footer";
import Navbar from "./components/navbar";

const LandingPage = () => {
  const { state: productState } = useProduct();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const token = localStorage.getItem("token") || "";

  const formatPrice = (price) => {
    return `P${Number(price).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
    })}`;
  };

  const handleAddToCart = async (product) => {
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add to cart");
      }

      await response.json();
      addToCart(product);
      alert(`${product.title} has been added to your cart!`);
    } catch (err) {
      setError(err.message);
    }
  };

  const closeModal = () => setShowLoginModal(false);

  return (
    <div className="landing-page">
      <Navbar />
      {/* Hero Section */}
      <div className="position-relative text-center text-white bg-dark rounded overflow-hidden">
        <img
          src="/banner.jpg"
          alt="Coffee Haven Banner"
          className="w-100 h-100 object-fit-cover opacity-75"
          style={{ maxHeight: "400px" }}
        />
        <div className="position-absolute top-50 start-50 translate-middle">
          <h1 className="display-4 fw-bold">Coffee Haven</h1>
          <p className="lead">Savor the Finest Coffee Blends</p>
          <Link to="/products">
            <Button variant="success" size="lg">
              Shop Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Featured Products */}
      <Container className="featured-products-container text-center shadow p-4 mt-5 rounded">
        <h4 className="favorites-title fs-4 text-center">Featured Products</h4>
        <Row className="mt-4">
          {productState.products.slice(0, 4).map((product, index) => (
            <Col lg={3} md={4} sm={6} xs={12} className="mb-4" key={index}>
              <Card className="favorite-card h-100 d-flex flex-column justify-content-between">
                <Card.Img
                  variant="top"
                  src={`http://localhost:8000/storage/${product.img}`}
                  alt={product.title}
                  className="cake-image"
                  onError={(e) => (e.target.src = "/placeholder.png")}
                />
                <Card.Body className="favorite-card-body d-flex flex-column">
                  <Card.Title className="text-center card-title">{product.title}</Card.Title>
                  <div className="d-flex justify-content-between mb-auto card-text">
                    <span>Price: {formatPrice(product.price)}</span>
                    <span>Stock: {product.stock}</span>
                  </div>
                </Card.Body>
                <Button
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
              </Card>
            </Col>
          ))}
        </Row>

        {error && (
          <Alert variant="danger" className="my-4">
            {error}
          </Alert>
        )}

        <div className="text-center mt-4">
          <Link to="/products">
            <Button className="btn btn-outline-success view-products">
              View All Products
            </Button>
          </Link>
        </div>
      </Container>

      {/* Sign-In Modal */}
      <Modal show={showLoginModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Sign In to Continue</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You need to sign in to add items to your cart.</p>
          <p>Don't have an account? <Link to="/register">Sign up now</Link> to start shopping!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
          <Link to="/login">
            <Button variant="success">Sign In</Button>
          </Link>
        </Modal.Footer>
      </Modal>

      <Footer />
    </div>
  );
};

export default LandingPage;