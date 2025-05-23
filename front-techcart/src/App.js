import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './Landing';
import Cart from './Cart';
import Checkout from './Checkout';
import Products from './Product';
import AdminProducts from './Adminproduct';
import AdminTransactions from './AdminTransaction';
import ProtectedRoute from './components/ProtectedRoute';
import { ProductProvider } from './context/ProductContext';
import ContactUs from './ContactUs';
import AboutUs from './AboutUs';

function App() {
  return (
    <ProductProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/products" element={<Products />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contactus" element={<ContactUs />} />

        {/* Protected Routes */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adminproducts"
          element={
            <ProtectedRoute>
              <AdminProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admintransactions"
          element={
            <ProtectedRoute>
              <AdminTransactions />
            </ProtectedRoute>
          }
        />
      </Routes>
    </ProductProvider>
  );
}

export default App;