import React, { createContext, useContext, useState } from 'react';
import axiosClient from '../axiosClient';
import { useNavigate } from 'react-router-dom';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addToCart = async (item) => {
    try {
      console.log('Attempting to add to cart, item:', item);
      const response = await axiosClient.post('/cart', {
        product_id: item.id,
        quantity: 1,
      });
      console.log('Add to cart response:', response.data);

      const newItem = { ...item, qty: 1, id: response.data.id };
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((i) => i.title === item.title);
        if (existingItem) {
          return prevItems.map((i) =>
            i.title === item.title ? { ...i, qty: i.qty + 1 } : i
          );
        }
        return [...prevItems, newItem];
      });

      setSelectedItems((prev) => {
        if (!prev.includes(item.title)) {
          return [...prev, item.title];
        }
        return prev;
      });
    } catch (err) {
      console.error('Add to cart failed:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      if (err.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert('Failed to add to cart. Please try again.');
      }
    }
  };

  const updateQuantity = async (title, qty) => {
    const itemToUpdate = cartItems.find((item) => item.title === title);
    if (!itemToUpdate || qty < 1 || qty > itemToUpdate.stock) return;

    try {
      const response = await axiosClient.put(`/cart/${itemToUpdate.id}`, {
        quantity: qty,
      });
      console.log('Update quantity response:', response.data);

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.title === title ? { ...item, qty } : item
        )
      );
    } catch (err) {
      console.error('Update quantity failed:', err);
      alert('Failed to update quantity. Please try again.');
    }
  };

  const removeFromCart = async (id) => {
    const itemToRemove = cartItems.find((item) => item.id === id);
    if (!itemToRemove) return;

    try {
      console.log('Attempting to remove from cart, id:', id);
      const response = await axiosClient.delete(`/cart/${id}`);
      console.log('Remove from cart response:', response.status, response.data);

      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
      setSelectedItems((prev) => prev.filter((itemTitle) => itemTitle !== itemToRemove.title));
      setSuccess(`${itemToRemove.title} has been removed from your cart! 🗑️`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Remove from cart failed:', err);
      if (err.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert('Failed to remove item. Please try again.');
      }
      if (itemToRemove) {
        setCartItems((prevItems) => [...prevItems, itemToRemove]);
        setSelectedItems((prev) => [...prev, itemToRemove.title]);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (title) => {
    setSelectedItems((prev) =>
      prev.includes(title)
        ? prev.filter((itemTitle) => itemTitle !== title)
        : [...prev, title]
    );
  };

  const clearCart = async () => {
    if (cartItems.length === 0) return;

    setLoading(true);
    console.log('Clearing cart, items to delete:', cartItems);

    try {
      await Promise.all(cartItems.map((item) => axiosClient.delete(`/cart/${item.id}`)));
      setCartItems([]);
      setSelectedItems([]);
      console.log('Cart cleared successfully');
    } catch (err) {
      console.error('Clear cart failed:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      if (err.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert('Failed to clear cart. Some items may remain.');
      }
    } finally {
      setLoading(false);
    }
  };

const fetchCartItems = async () => {
  try {
    setLoading(true);
    const response = await axiosClient.get('/cart');
    setCartItems(response.data);
    setSelectedItems(response.data.map((item) => item.title));
  } catch (err) {
    console.error('Fetch cart items failed:', err);
    if (err.response?.status === 401) {
      alert('Session expired. Please login again.');
      localStorage.removeItem('token');
      navigate('/login');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        selectedItems,
        setSelectedItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        toggleItemSelection,
        clearCart,
        fetchCartItems,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);