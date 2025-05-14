import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from 'react-router-dom';
import '../pages/Login.css';
import axiosClient from '../axiosClient';
import { useState } from 'react';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosClient.post('/login', {
        email,
        password,
      });

      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect based on role
      const userRole = response.data.user.role;
      if (userRole === 'admin') {
        navigate('/admintransactions');
      } else {
        navigate('/');
      }
    } catch (error) {
      alert('Login failed. Please check your email and password.');
      console.error(error);
    }
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center vh-100">
      <form className="login-form shadow p-4 rounded" onSubmit={handleLogin}>
        <h2 className="text-center mb-2">
          <span className="brand1">TechCart </span><span className="brand-black">‘n </span><span className="brand">Online PC Components Store</span>
        </h2>

        <p>Log in to your account and enjoy the fresh experience.</p>

        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="forgot">Forgot Password?</p>
        </div>

        <button type="submit" className="btn btn-primary w-100 text-center">Login</button>

        <p className="sign-up">
          New Customer? <b className="now"><Link to="/register" className="now">Sign Up Now</Link></b>
        </p>
      </form>
    </div>
  );
}

export default Login;