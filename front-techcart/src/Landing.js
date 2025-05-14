import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './context/CartContext';
import { useProduct } from './context/ProductContext';
import './App.css';
import Footer from './components/footer';
import Navbar from './components/navbar';

const LandingPage = () => {
  const { state: productState } = useProduct();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const formatPrice = (price) => {
    return `P${Number(price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  };

  useEffect(() => {
    if (!token) return;
    fetchCartItems();
  }, [token]);

  const fetchCartItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch cart items');
      const data = await response.json();
      setCartItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!token) {
      navigate('/login');
      return;
    }

    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add to cart');
      }

      await response.json();
      await fetchCartItems();
      addToCart(product);
      alert(`${product.title} has been added to your cart!`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="landing-page">
      <Navbar />
      <div className="hero-image">
        <img src="Techcart.png" alt="TechCart Banner" className="hero-img" />
      </div>

      <Container className="text-center my-4">
        <div className="welcome-text">
          Step into a world where innovation meets convenience — where every click brings you closer to performance, style, and the tools to power your digital journey. At TechCart, every accessory is part of your story.
        </div>
      </Container>

      <Container className="customer-favorites text-center">
        <h4 className="favorites-title">CUSTOMER FAVORITES</h4>
        <Row className="mt-4">
          {productState.products.map((product, index) => (
            <Col md={4} sm={6} xs={12} className="mb-4" key={index}>
              <Card className="favorite-card h-100 d-flex flex-column justify-content-between">
                <Card.Img
                  variant="top"
                  src={`http://localhost:8000/storage/${product.img}`}
                  alt={product.title}
                  className="cake-image"
                  onError={(e) => {
                    console.error(`Image load failed for ${product.img}`, e);
                    e.target.src = '/placeholder.png';
                  }}
                />
                <Card.Body className="favorite-card-body d-flex flex-column">
                  <Card.Title className="text-center card-title">{product.title}</Card.Title>
                  <div className="d-flex justify-content-between mb-auto card-text">
                    <span>Price: {formatPrice(product.price)}</span>
                    <span>Stock: {product.stock}</span>
                  </div>
                </Card.Body>
                <Button className="add-to-cart-btn" onClick={() => handleAddToCart(product)}>
                  Add to Cart
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <Container className="my-4">
        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
        {loading && <Alert variant="info" className="mb-4">Loading cart...</Alert>}
        {cartItems.length > 0 ? (
          <div>
            <h4 className="cart-title text-center">Your Cart</h4>
            <Row>
              {cartItems.map((item, index) => (
                <Col md={4} sm={6} xs={12} className="mb-4" key={index}>
                  <Card className="favorite-card h-100 d-flex flex-column justify-content-between">
                                      <Card.Img
                        variant="top"
                        src={`http://localhost:8000/storage/${item.img || item.image}`}
                        alt={item.title}
                        className="cake-image"
                        onError={(e) => (e.target.src = '/placeholder.png')}
                      />
                    <Card.Body className="favorite-card-body d-flex flex-column">
                      <Card.Title className="text-center card-title">{item.title}</Card.Title>
                      <div className="d-flex justify-content-between mb-auto card-text">
                        <span>Price: {formatPrice(item.price)}</span>
                        <span>Quantity: {item.qty}</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-3">You have no items in your cart.</p>
          </div>
        )}

        <div className="text-center">
          <Link to="/products">
            <button className="view-all-btn">VIEW ALL PRODUCTS</button>
          </Link>
        </div>
      </Container>

      <Footer />
    </div>
  );
};

export default LandingPage;
