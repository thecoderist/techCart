import React, { useState } from 'react';
import '../pages/Signup.css';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../axiosClient';

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    birthday: '',
    gender: '',
    address: '',
    contact_number: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosClient.post('http://localhost:8000/api/register', form);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('User data saved to localStorage:', response.data.user); 
      navigate('/login');
    } catch (error) {
      alert('Registration failed. Please check your input.');
      console.error('Registration error:', error.response?.data || error.message);
    }
  };

  return (
    <div className="signup-container d-flex justify-content-center align-items-center vh-100">
      <form className="signup-form shadow p-4 rounded" onSubmit={handleRegister}>
        <h2 className="text-center mb-2">
          <span className="brand1">TechCart </span><span className="brand-black">‘n </span><span className="brand">Online PC Components Store</span>
        </h2>
        <p className="text-center mb-4">Register to enjoy the sweet treats of Wake ‘n Bake.</p>

        <div className="row">
          <div className="col-md-6 mb-3">
            <input type="text" className="form-control" name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} required />
          </div>
          <div className="col-md-6 mb-3">
            <input type="text" className="form-control" name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} required />
          </div>
          <div className="col-md-6 mb-3">
            <input type="date" className="form-control" name="birthday" value={form.birthday} onChange={handleChange} required />
          </div>
          <div className="col-md-6 mb-3">
            <select
              className="form-control"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="col-md-12 mb-3">
            <input type="text" className="form-control" name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
          </div>
          <div className="col-md-6 mb-3">
            <input type="text" className="form-control" name="contact_number" placeholder="Contact Number" value={form.contact_number} onChange={handleChange} required />
          </div>
          <div className="col-md-6 mb-3">
            <input type="email" className="form-control" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="col-md-6 mb-3">
            <input type="password" className="form-control" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          </div>
          <div className="col-md-6 mb-3">
            <input type="password" className="form-control" name="password_confirmation" placeholder="Confirm Password" value={form.password_confirmation} onChange={handleChange} required />
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-100 mb-3">Sign Up</button>

        <p className="text-center">Already have an account? <Link to="/login" className="login-link">Login</Link></p>
      </form>
    </div>
  );
}

export default Register;