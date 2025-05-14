import React, { useEffect, useState } from "react";
import { Container, Button, Form, Modal, Alert, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "./components/adminnavbar";
import { useProduct } from "./context/ProductContext";
import "./App.css";

const AdminProducts = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useProduct();
  const { products, loading, error } = state;

  const [token] = useState(localStorage.getItem("token") || "");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    image: null,
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchProducts();
    }
  }, [token, navigate]);

  const fetchProducts = async () => {
    dispatch({ type: "SET_LOADING" });
    try {
      const res = await fetch("http://localhost:8000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const data = await res.json();
      dispatch({ type: "SET_PRODUCTS", payload: data });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormValues(prev => ({ ...prev, image: file }));
  };

  const openModal = (product = null) => {
    setEditProduct(product);
    setFormValues(
      product
        ? { ...product, image: null }
        : { title: "", description: "", price: "", stock: "", image: null }
    );
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const isEdit = Boolean(editProduct);

    Object.entries(formValues).forEach(([key, value]) => {
      if (key !== "image" || value) formData.append(key, value);
    });

    if (isEdit) formData.append("_method", "PUT");

    const url = isEdit
      ? `http://localhost:8000/api/products/${editProduct.id}`
      : `http://localhost:8000/api/products`;

    try {
      const res = await fetch(url, {
        method: "POST", // Laravel handles PUT via _method
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const savedProduct = await res.json();

      dispatch({
        type: isEdit ? "UPDATE_PRODUCT" : "ADD_PRODUCT",
        payload: savedProduct,
      });

      setShowModal(false);
      setEditProduct(null);
      setFormValues({ title: "", description: "", price: "", stock: "", image: null });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`http://localhost:8000/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      dispatch({ type: "DELETE_PRODUCT", payload: id });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  };

  return (
    <div className="landing-page">
      <AdminNavbar />
      <Container className="my-4">
        <h3 className="cart-title text-dark">
          <span className="text-danger">ADMIN</span> MANAGE PRODUCTS
        </h3>

        {error && <Alert variant="danger">{error}</Alert>}
        {loading && <Alert variant="info">Loading...</Alert>}

        <Button className="mb-2 edit-btn" onClick={() => openModal()}>
        Adding Product<i className="bi bi-folder-plus ms-1"></i>
        </Button>

        <Table responsive bordered className="cart-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Description</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
  {products.length === 0 && !loading ? (
    <tr>
      <td colSpan="6" className="text-center">No products available</td>
    </tr>
  ) : (
    products.map((product) => (
      <tr key={product.id}>
        <td>
          <img
            src={`http://localhost:8000/storage/${product.image}`}
            alt={product.title}
            style={{ width: "50px", height: "50px", objectFit: "cover" }}
            onError={(e) => (e.target.src = "/placeholder.png")}
          />
        </td>
        <td>{product.title}</td>
        <td>
          <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
            {product.description.split("\n").map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </td>
        <td>P{product.price}</td>
        <td>{product.stock}</td>
        <td>
          <div className="d-flex gap-2">
            <Button size="sm" onClick={() => openModal(product)} className="edit-btn"><i className="bi bi-pencil-square"></i></Button>
            <Button variant="danger" size="sm" onClick={() => handleDelete(product.id)}><i className="bi bi-trash3-fill"></i></Button>
          </div>
        </td>
      </tr>
    ))
  )}
</tbody>

        </Table>

        {/* Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{editProduct ? "Edit Product" : "Add New Product"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit} encType="multipart/form-data">
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formValues.title}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={formValues.description}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={formValues.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Stock</Form.Label>
                <Form.Control
                  type="number"
                  name="stock"
                  value={formValues.stock}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!editProduct}
                />
              </Form.Group>

              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default AdminProducts;
