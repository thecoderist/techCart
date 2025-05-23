import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Toast, ToastContainer, Form, FormControl, Modal } from "react-bootstrap";
import { FaSearch, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import Footer from "./components/footer";
import Navbar from "./components/navbar";
import { useCart } from "./context/CartContext";
import axiosClient from "./axiosClient";

const BACKEND_BASE_URL = "http://localhost:8000";

const Products = () => {
  const { addToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState(location.state?.products || []);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || "");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosClient.get("/products", {
          params: { search: searchTerm },
        });
        if (!Array.isArray(response.data)) {
          throw new Error("Invalid product data received");
        }
        setProducts(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchTerm]);

  const handleAddToCart = async (item) => {
    if (!token) {
      setSelectedProduct(item);
      setShowLoginModal(true);
      return;
    }

    setError(null);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: item.id,
          quantity: 1,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        setToken("");
        setShowLoginModal(true);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add to cart");
      }

      await response.json();
      await addToCart(item);
      setSuccess(`${item.title} added to your cart!`);
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setError("Please enter a search term.");
      return;
    }
    navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
  };

  const closeModal = () => {
    setShowLoginModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="landing-page">
      <Navbar />
      {/* Toast Container for Alerts */}
      <ToastContainer position="top-end" className="p-3 toast-container" style={{ zIndex: 1050 }}>
        {/* Success Toast */}
        {success && (
          <Toast
            onClose={() => setSuccess(null)}
            show={!!success}
            delay={5000}
            autohide
            className="toast-success"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <Toast.Header closeButton>
              <FaCheckCircle className="me-2" />
              <strong className="me-auto">Success</strong>
            </Toast.Header>
            <Toast.Body>
              {success}
              <div className="mt-2">
                <Link to="/cart" className="text-decoration-underline text-white">
                  View Cart
                </Link>
                <p className="mt-1 small">Add more for free shipping!</p>
              </div>
            </Toast.Body>
          </Toast>
        )}
        {/* Error Toast */}
        {error && (
          <Toast
            onClose={() => setError(null)}
            show={!!error}
            delay={5000}
            autohide
            className="toast-error"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <Toast.Header closeButton>
              <FaExclamationTriangle className="me-2" />
              <strong className="me-auto">Error</strong>
            </Toast.Header>
            <Toast.Body>{error}</Toast.Body>
          </Toast>
        )}
        {/* Loading Toast */}
        {loading && (
          <Toast show={loading} className="toast-info" role="alert" aria-live="polite" aria-atomic="true">
            <Toast.Header closeButton={false}>
              <strong className="me-auto">Loading</strong>
            </Toast.Header>
            <Toast.Body>
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              Loading products...
            </Toast.Body>
          </Toast>
        )}
      </ToastContainer>

      <Container className="customer-favorites text-center mt-5">
        {/* Search Bar */}
        <Form className="d-flex align-items-center mb-4 justify-content-center search-form" onSubmit={handleSearch}>
          <FormControl
            type="search"
            className="me-2 search-input"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: "300px" }}
            aria-label="Search products"
          />
          <Button variant="outline-success" type="submit" aria-label="Search">
            <FaSearch />
          </Button>
        </Form>

        <h3>{searchTerm ? `Search Results for "${searchTerm}"` : "All Products"}</h3>
        <Row>
          {products.length > 0 ? (
            products.map((item, index) => {
              const imageUrl = item.image
                ? `${BACKEND_BASE_URL}/storage/${item.image}`
                : "/placeholder.png";
              return (
                <Col md={4} sm={6} xs={12} className="mb-4" key={item.id || index}>
                  <Card className="favorite-card h-100 d-flex flex-column justify-content-between">
                    <Card.Img
                      variant="top"
                      src={imageUrl}
                      alt={item.title || "Product image"}
                      className="cake-image"
                      onError={(e) => (e.target.src = "/placeholder.png")}
                    />
                    <Card.Body className="favorite-card-body d-flex flex-column text-light">
                      <Card.Title className="text-center card-title">
                        {item.title || "Untitled Product"}
                      </Card.Title>
                      <ul className="flex-grow-1 text-light">
                        {item.description
                          ? item.description.split("\n").map((desc, descIndex) => (
                              <li key={descIndex}>{desc}</li>
                            ))
                          : <li>No description available</li>}
                      </ul>
                      <div className="d-flex justify-content-between card-text">
                        <span>
                          Price: {item.price ? `P${item.price.toLocaleString("en-PH", { minimumFractionDigits: 2 })}` : "N/A"}
                        </span>
                        <span>Stock: {item.stock ?? "N/A"}</span>
                      </div>
                    </Card.Body>
                    <Button
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(item)}
                      disabled={item.stock === 0}
                      aria-label={`Add ${item.title || "product"} to cart`}
                    >
                      {item.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                  </Card>
                </Col>
              );
            })
          ) : (
            <Col>
              <p className="text-center">
                {searchTerm ? `No products found matching "${searchTerm}".` : "No products available."}
              </p>
            </Col>
          )}
        </Row>
      </Container>

      {/* Sign-In Modal */}
      <Modal show={showLoginModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Sign In to Add to Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {selectedProduct
              ? `Sign in to add "${selectedProduct.title}" to your cart.`
              : "Sign in to add items to your cart."}
          </p>
          <p>
            New to Coffee Haven?{" "}
            <Link to="/register" className="text-success">
              Create an account
            </Link>{" "}
            to start shopping!
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Continue Browsing
          </Button>
          <Link to="/login">
            <Button variant="success">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button variant="outline-success">Sign Up</Button>
          </Link>
        </Modal.Footer>
      </Modal>

      <Footer />
    </div>
  );
};

export default Products;