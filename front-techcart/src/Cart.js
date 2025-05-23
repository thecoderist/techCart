import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Container, Image, Modal, Alert } from 'react-bootstrap';
import Navbar from './components/navbar';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';
import Footer from './components/footer';
import { useCart } from './context/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, setCartItems, selectedItems, setSelectedItems, toggleItemSelection, updateQuantity, removeFromCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState(1);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // State for success message
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCartItems();
  }, [token, navigate]);

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
      console.log('Cart Items:', data);
      setCartItems(data);
      setSelectedItems(data.map(item => item.title));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (id, quantity) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/cart/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update quantity');
      }
      const updatedItem = await response.json();
      updateQuantity(updatedItem.title, updatedItem.qty);
      await fetchCartItems();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (id) => {
    setLoading(true);
    setError(null);
    let itemToRemove = cartItems.find(item => item.id === id); // Declare outside try block

    try {
      if (itemToRemove) {
        removeFromCart(itemToRemove.title); // Remove from local state immediately
      }

      const response = await fetch(`http://localhost:8000/api/cart/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Delete response status:', response.status); // Debug log
      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      // Check if the response is successful (200 or 204)
      if (response.status === 200 || response.status === 204) {
        // No need to parse JSON for DELETE if successful
        setSuccess(`${itemToRemove.title} has been removed from your cart! 🗑️`); // Set success message
        setTimeout(() => setSuccess(null), 3000); // Auto-dismiss after 3 seconds
        await fetchCartItems(); // Sync with backend
      } else {
        const errorData = await response.json(); // Attempt to get error details
        throw new Error(errorData.error || 'Failed to remove item from server');
      }
    } catch (err) {
      setError(err.message);
      // Revert local state if the server call failed
      if (itemToRemove) {
        setCartItems(prevItems => [...prevItems, itemToRemove]);
        setSelectedItems(prev => [...prev, itemToRemove.title]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price for selected items
  const totalPrice = cartItems
    .filter(item => selectedItems.includes(item.title))
    .reduce((total, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price.replace('P', '')) : parseFloat(item.price) || 0;
      return total + (price * item.qty);

    }, 0);

  // Handle opening the modal for editing
  const handleEditClick = (item) => {
    setSelectedItem(item);
    setNewQuantity(item.qty);
    setShowModal(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setNewQuantity(1);
  };

  // Handle saving the updated quantity
  const handleSaveChanges = () => {
    if (selectedItem && newQuantity >= 1 && newQuantity <= selectedItem.stock) {
      handleUpdateQuantity(selectedItem.id, newQuantity);
    }
    handleCloseModal();
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
            <p className="mb-0">Keep managing your cart! 🛒</p>
          </Alert>
        </div>
      )}
      <Container className="my-4">
        <div className="position-relative mb-4">
          <i
            className="bi bi-arrow-left-square-fill position-absolute"
            style={{ fontSize: "2rem", cursor: "pointer", left: "0", top: "50%", transform: "translateY(-50%)" }}
            onClick={() => navigate('/Products')}
          ></i>
          <h3 className="cart-title text-center">My Shopping Cart</h3>
        </div>

        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
        {loading && <Alert variant="info" className="mb-4">Loading...</Alert>}

        <div className="cart-table-container">
          <Table responsive bordered className="cart-table">
            <thead>
              <tr>
                <th>Choose</th>
                <th>Image</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.length === 0 && !loading ? (
                <tr>
                  <td colSpan="7" className="empty-cart-message">
                    Your cart is empty
                  </td>
                </tr>
              ) : (
                cartItems.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>
                      <Form.Check 
                        type="checkbox" 
                        checked={selectedItems.includes(item.title)}
                        onChange={() => toggleItemSelection(item.title)}
                        disabled={loading}
                      />
                    </td>
                    <td>
                      <Image 
                        src={`http://localhost:8000/storage/${item.img}`} 
                        alt={item.title} 
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                        onError={(e) => (e.target.src = '/placeholder.png')}
                      />
                    </td>
                    <td>{item.title}</td>
                    <td>
                      <div className="quantity-control">
                        <Button 
                          size="sm" 
                          variant="outline-secondary"
                          onClick={() => handleUpdateQuantity(item.id, item.qty - 1)}
                          disabled={item.qty <= 1 || loading}
                        >
                          -
                        </Button>
                        <span className="mx-2">{item.qty}</span>
                        <Button 
                          size="sm" 
                          variant="outline-secondary"
                          onClick={() => handleUpdateQuantity(item.id, item.qty + 1)}
                          disabled={item.qty >= item.stock || loading}
                        >
                          +
                        </Button>
                      </div>
                    </td>
                    <td>{typeof item.price === 'number' ? `P${item.price.toFixed(2)}` : item.price}</td>
                    <td>P{(typeof item.price === 'number' ? item.price : parseFloat(item.price.replace('P', '')) * item.qty).toFixed(2)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          size="sm" 
                          className="edit-btn"
                          onClick={() => handleEditClick(item)}
                          disabled={loading}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          className="delete-btn"
                          onClick={() => handleRemoveFromCart(item.id)}
                          disabled={loading}
                        >
                          Delete
                        </Button>
                      </div>    
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {cartItems.length > 0 && !loading && (
          <div className="total-price text-right mb-3">
            <h4 className="text-dark">Total: P{totalPrice.toFixed(2)}</h4>
          </div>
        )}

        <Link to="/checkout" className="text-decoration-none">
          <div className="checkout-btn-container">
            <Button size="sm" className="checkout-btn" disabled={selectedItems.length === 0 || loading}>
              CHECKOUT
            </Button>
          </div>
        </Link>
      </Container>

      {/* Edit Modal */}
      {selectedItem && (
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Item: {selectedItem.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3" controlId="formQuantity">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max={selectedItem.stock}
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Number(e.target.value))}
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  Available stock: {selectedItem.stock}
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formTotal">
                <Form.Label>Total</Form.Label>
                <Form.Control
                  type="text"
                  value={`P${(typeof selectedItem.price === 'number' ? selectedItem.price : parseFloat(selectedItem.price.replace('P', '')) * newQuantity).toFixed(2)}`}
                  readOnly
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSaveChanges} disabled={loading}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <Footer />
    </div>
  );
};

export default Cart;