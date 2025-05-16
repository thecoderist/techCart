import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form, FormControl } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import './App.css';
import Footer from './components/footer';
import Navbar from './components/navbar';
import { useCart } from './context/CartContext';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosClient from './axiosClient';

// Define the backend base URL for images
const BACKEND_BASE_URL = 'http://localhost:8000';

const Products = () => {
  const { addToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState(location.state?.products || []);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');

  // Fetch products from API when component mounts or search term changes
  useEffect(() => {
    const fetchProducts = async () => {
      if (location.state?.products && location.state?.searchTerm === searchTerm) {
        console.log('Skipping fetch: Using state products');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        console.log('Fetching products with search term:', searchTerm);
        const response = await axiosClient.get('/products', {
          params: { search: searchTerm },
        });
        console.log('Fetch response:', response.data);
        setProducts(response.data);
      } catch (err) {
        console.error('Fetch products error:', err);
        setError('Failed to fetch products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location.state, searchTerm]);

  const handleAddToCart = async (item) => {
    setError(null);
    try {
      await addToCart(item);
      setSuccess(`${item.title} has been added to your cart! 🎉`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Add to cart error:', err);
      setError('Failed to add,to cart. Please try again.');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      alert('Please enter a search term.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Searching products with term:', searchTerm);
      const response = await axiosClient.get('/products', {
        params: { search: searchTerm },
      });
      console.log('Search response:', response.data);
      setProducts(response.data);
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`, {
        state: { products: response.data, searchTerm },
      });
    } catch (error) {
      console.error('Search failed:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      setError('Error during search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      <Navbar />
      {/* Fixed Success Alert */}
      {success && (
        <div className="fixed-alert">
          <Alert
            variant="success"
            className="mb-0 alert-custom"
            onClose={() => setSuccess(null)}
            dismissible
          >
            <Alert.Heading>Success!</Alert.Heading>
            <p>{success}</p>
            <hr />
            <p className="mb-0">Check your cart or keep shopping! 🛒</p>
          </Alert>
        </div>
      )}
      <Container className="customer-favorites text-center mt-5">
        {/* Search Bar */}
        <Form className="d-flex align-items-center mb-4 justify-content-center search-form" onSubmit={handleSearch}>
          <FormControl
            type="search"
            className="me-2 search-input"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
          <FaSearch
            className="icon"
            onClick={() => document.querySelector('.search-form').requestSubmit()}
          />
        </Form>

        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
        {loading && <Alert variant="info" className="mb-4">Loading...</Alert>}
        <h3>Search Results for "{searchTerm}"</h3>
        <Row>
          {products.length > 0 ? (
            products.map((item, index) => {
              // Construct the full image URL
              const imageUrl = item.image_url ? `${BACKEND_BASE_URL}${item.image_url}` : '/placeholder.png';
              console.log(`Loading image for ${item.title}: ${imageUrl}`);

              return (
                <Col md={4} sm={6} xs={12} className="mb-4" key={index}>
                  <Card className="favorite-card h-100 d-flex flex-column justify-content-between">
                    <Card.Img
                      variant="top"
                      src={imageUrl}
                      alt={item.title}
                      className="cake-image "
                      onError={(e) => {
                        console.log(`Failed to load image for ${item.title}: ${imageUrl}`);
                        e.target.src = '/placeholder.png';
                      }}
                    />
                 <Card.Body className="favorite-card-body d-flex flex-column">
                <Card.Title className="text-center card-title">{item.title}</Card.Title>

                <ul className="flex-grow-1">
                  {item.description.split('\n').map((desc, index) => (
                    <li key={index}>{desc}</li>
                  ))}
                </ul>

                <div className="d-flex justify-content-between card-text">
                  <span>Price: {item.price ? `P${item.price}` : 'N/A'}</span>
                  <span>Stock: {item.stock}</span>
                </div>
              </Card.Body>
              <Button className="add-to-cart-btn" onClick={() => handleAddToCart(item)}>
                Add to Cart
              </Button>
                  </Card>
                </Col>
              );
            })
          ) : (
            <Col>
              <p className="text-center">No products found matching "{searchTerm}".</p>
            </Col>
          )}
        </Row>
      </Container>
      <Footer />
    </div>
  );
};

export default Products;