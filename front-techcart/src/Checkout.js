import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Table, Alert } from 'react-bootstrap';
import Footer from './components/footer';
import Navbar from './components/navbar';
import './App.css';
import { useCart } from './context/CartContext';
import jsPDF from 'jspdf';

const Checkout = () => {
  const { cartItems, selectedItems, fetchCartItems } = useCart(); // Added fetchCartItems here
  const [customer, setCustomer] = useState({});
  const [orders, setOrders] = useState([]);
  const [checkoutStatus, setCheckoutStatus] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [localLoading, setLocalLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const fetchCustomerDetails = () => {
      const userData = JSON.parse(localStorage.getItem('user')) || {};
      setCustomer({
        name: `${userData.first_name || ''} ${userData.last_name || ''}`,
        address: userData.address || '',
        contact: userData.contact_number || '',
        email: userData.email || '',
        birthday: userData.birthday || '',
        gender: userData.gender || ''
      });
    };

    const updateOrders = () => {
      const orderData = cartItems
        .filter(item => selectedItems.includes(item.title))
        .map((item, index) => ({
          id: index + 1,
          productId: item.id,
          productName: item.title,
          qty: item.qty || 1,
          price: parseFloat(item.price?.replace('P', '') || '0') || 0
        }));
      setOrders(orderData);
    };

    fetchCustomerDetails();
    updateOrders();
  }, [cartItems, selectedItems]);

  const totalAmount = orders.reduce((total, order) => {
    const price = Number(order.price) || 0;
    const qty = Number(order.qty) || 0;
    return total + (price * qty);
  }, 0);

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch order details');
      }

      setOrders(data.items.map((item, index) => ({
        ...item,
        productId: item.product_id,
        id: index + 1,
      })));
      setCustomer({
        name: data.customer.name,
        email: data.customer.email,
        address: data.customer.address,
        contact: data.customer.contact,
        birthday: data.customer.birthday,
        gender: data.customer.gender,
      });
    } catch (error) {
      setCheckoutStatus({ type: 'danger', message: error.message });
    }
  };

  const generatePDF = (orderId, total) => {
    const doc = new jsPDF();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(105, 78, 78);

    doc.text('Checkout Receipt', 10, 10);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 20);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Details', 10, 30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    let yPosition = 40;
    doc.text(`Name: ${customer.name || 'Not provided'}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Email: ${customer.email || 'Not provided'}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Address: ${customer.address || 'Not provided'}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Contact Number: ${customer.contact || 'Not provided'}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Birthday: ${customer.birthday || 'Not provided'}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Gender: ${customer.gender ? customer.gender.charAt(0).toUpperCase() + customer.gender.slice(1) : 'Not provided'}`, 10, yPosition);

    yPosition += 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Details', 10, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(105, 78, 78);
    doc.setTextColor(255, 255, 255);
    doc.rect(10, yPosition, 190, 10, 'F');
    doc.text('Product ID', 12, yPosition + 7);
    doc.text('Product Name', 40, yPosition + 7);
    doc.text('Qty', 130, yPosition + 7);
    doc.text('Total Price/Amount', 150, yPosition + 7);
    yPosition += 10;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    orders.forEach((order) => {
      doc.setFillColor(230, 230, 230);
      doc.rect(10, yPosition, 30, 10, 'F');
      doc.text(order.productId ? order.productId.toString() : 'N/A', 12, yPosition + 7);
      doc.text(order.product_name || order.productName, 40, yPosition + 7, { maxWidth: 90 });
      doc.text((order.quantity || order.qty).toString(), 130, yPosition + 7);
      doc.text(`P${(order.total_price || Number(order.price) * order.qty).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 150, yPosition + 7);
      yPosition += 10;
    });

    yPosition += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 107, 139);
    doc.text(`Total Amount: P${total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 10, yPosition);

    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Order ID: ${orderId || 'N/A'}`, 10, yPosition);

    yPosition += 20;
    doc.setFontSize(10);
    doc.text('Thank you for shopping with TechCart!', 10, yPosition);

    doc.save(`checkout_receipt_order_${orderId || 'pending'}.pdf`);
  };

  const handleCheckout = async () => {
    if (orders.length === 0) {
      setCheckoutStatus({ type: 'danger', message: 'No orders to checkout. Please select items in your cart.' });
      return;
    }

    setLocalLoading(true);
    setCheckoutStatus(null);

    try {
      const response = await fetch('http://localhost:8000/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: orders.map(item => ({
            product_id: item.productId,
            quantity: item.qty,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Checkout failed');
      }

      setOrderId(data.order_id);
      setCheckoutStatus({ type: 'success', message: data.message });
      await fetchOrderDetails(data.order_id);
      generatePDF(data.order_id, data.total);

      // Sync with backend by fetching updated cart
      await fetchCartItems();

      // Reset local state
      setCustomer({});
      setOrders([]);
      setOrderId(null);
    } catch (error) {
      setCheckoutStatus({ type: 'danger', message: error.message });
    } finally {
      setLocalLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `P${Number(price || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="landing-page">
      <Navbar />
      <Container className="checkout-process mt-5">
        {checkoutStatus && (
          <Alert variant={checkoutStatus.type} className="mb-4">
            {checkoutStatus.message}
          </Alert>
        )}
        <Card className="customer-details mb-3">
          <Card.Body>
            <Card.Title className="seller-title">CUSTOMER DETAILS</Card.Title>
            <Card.Text className="customer-text">
              <strong>Name:</strong> {customer.name || 'Not provided'} <br />
              <strong>Email:</strong> {customer.email || 'Not provided'} <br />
              <strong>Address:</strong> {customer.address || 'Not provided'} <br />
              <strong>Contact Number:</strong> {customer.contact || 'Not provided'} <br />
              <strong>Birthday:</strong> {customer.birthday || 'Not provided'} <br />
              <strong>Gender:</strong> {customer.gender ? customer.gender.charAt(0).toUpperCase() + customer.gender.slice(1) : 'Not provided'}
            </Card.Text>
          </Card.Body>
        </Card>

        <Card className="item-details">
          <Card.Body>
            <Card.Title className="seller-title">ORDER DETAILS</Card.Title>
            <Table striped bordered hover>
              <thead className="table-header">
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Qty</th>
                  <th>Total Price/Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">No orders selected.</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id || order.productName}>
                      <td>{order.productId || 'N/A'}</td>
                      <td>{order.product_name || order.productName}</td>
                      <td>{order.quantity || order.qty}</td>
                      <td>{formatPrice(order.total_price || order.price * order.qty)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
            {orders.length > 0 && (
              <div className="total-amount text-right">
                <h4>Total Amount: {formatPrice(totalAmount)}</h4>
              </div>
            )}
          </Card.Body>
        </Card>

        <Button
          variant="primary"
          className="checkout-btn mt-3 ms-auto d-block"
          onClick={handleCheckout}
          disabled={localLoading}
        >
          {localLoading ? 'Processing...' : 'CHECK OUT'}
        </Button>
      </Container>
      <Footer />
    </div>
  );
};

export default Checkout;