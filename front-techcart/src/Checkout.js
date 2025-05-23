import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Table, Alert } from 'react-bootstrap';
import Footer from './components/footer';
import Navbar from './components/navbar';
import './App.css';
import { useCart } from './context/CartContext';
import jsPDF from 'jspdf';

const Checkout = () => {
  const { cartItems, selectedItems, fetchCartItems } = useCart();
  const [customer, setCustomer] = useState({});
  const [orders, setOrders] = useState([]);
  const [checkoutStatus, setCheckoutStatus] = useState(null);
  const [token] = useState(localStorage.getItem('token') || '');
  const [localLoading, setLocalLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    setCustomer({
      name: `${userData.first_name || ''} ${userData.last_name || ''}`,
      address: userData.address || '',
      contact: userData.contact_number || '',
      email: userData.email || '',
      birthday: userData.birthday || '',
      gender: userData.gender || ''
    });

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
  }, [cartItems, selectedItems]);

  const totalAmount = orders.reduce((total, order) => {
    return total + (Number(order.price) * Number(order.qty));
  }, 0);

  const generatePDF = (orderId, total) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(84, 49, 30); // coffee brown
    doc.text('Coffee Haven Receipt', 10, 10);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 20);
    doc.setFontSize(14);
    doc.text('Customer Details', 10, 30);

    let y = 40;
    Object.entries(customer).forEach(([key, value]) => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value || 'N/A'}`, 10, y);
      y += 10;
    });

    y += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Details', 10, y);
    y += 10;

    orders.forEach(order => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`${order.productName} (x${order.qty}) - P${(order.qty * order.price).toFixed(2)}`, 10, y);
      y += 10;
    });

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: P${total.toFixed(2)}`, 10, y);
    y += 10;
    doc.text(`Order ID: ${orderId || 'N/A'}`, 10, y);
    y += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your purchase at Coffee Haven ☕', 10, y);

    doc.save(`CoffeeHaven_Order_${orderId || 'receipt'}.pdf`);
  };

  const handleCheckout = async () => {
    if (orders.length === 0) {
      setCheckoutStatus({ type: 'danger', message: 'No items selected. Please go back to your cart.' });
      return;
    }

    setLocalLoading(true);
    setCheckoutStatus(null);

    try {
      const response = await fetch('http://localhost:8000/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: orders.map(item => ({
            product_id: item.productId,
            quantity: item.qty,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Checkout failed.');

      setOrderId(data.order_id);
      setCheckoutStatus({ type: 'success', message: data.message });
      generatePDF(data.order_id, data.total);
      await fetchCartItems();
      setOrders([]);
    } catch (error) {
      setCheckoutStatus({ type: 'danger', message: error.message });
    } finally {
      setLocalLoading(false);
    }
  };

  const formatPrice = (price) =>
    `P${Number(price).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="landing-page">
      <Navbar />
      <Container className="mt-5 mb-4 checkout-process">
        {checkoutStatus && (
          <Alert variant={checkoutStatus.type} className="mb-4 text-center fw-bold">
            {checkoutStatus.message}
          </Alert>
        )}

        <Card className="mb-4 shadow-sm border-0 rounded customer-details-card">
          <Card.Body>
            <Card.Title className="text-center text-brown fs-4 mb-3">☕ Customer Details</Card.Title>
            <Card.Text className="fs-6 text-dark">
              <strong>Name:</strong> {customer.name}<br />
              <strong>Email:</strong> {customer.email}<br />
              <strong>Address:</strong> {customer.address}<br />
              <strong>Contact Number:</strong> {customer.contact}<br />
              <strong>Birthday:</strong> {customer.birthday}<br />
              <strong>Gender:</strong> {customer.gender}
            </Card.Text>
          </Card.Body>
        </Card>

        <Card className="shadow-sm border-0 rounded">
          <Card.Body>
            <Card.Title className="text-center text-brown fs-4 mb-3">🛒 Order Details</Card.Title>
            <Table bordered responsive className="text-center align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Product ID</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan="4">No items selected.</td></tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id}>
                      <td>{order.productId}</td>
                      <td>{order.productName}</td>
                      <td>{order.qty}</td>
                      <td>{formatPrice(order.qty * order.price)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
            {orders.length > 0 && (
              <div className="text-end mt-3">
                <h5 className="text-brown fw-bold">Total: {formatPrice(totalAmount)}</h5>
              </div>
            )}
          </Card.Body>
        </Card>

        <div className="text-center mt-4">
          <Button
            variant="success"
            size="lg"
            className="px-5 fw-bold"
            onClick={handleCheckout}
            disabled={localLoading}
          >
            {localLoading ? 'Processing...' : 'Complete Checkout'}
          </Button>
        </div>
      </Container>
      <Footer />
    </div>
  );
};

export default Checkout;
