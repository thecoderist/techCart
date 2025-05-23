import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";
import "../pages/Login.css";
import axiosClient from "../axiosClient";
import { useState } from "react";

function Login() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleLogin = async (e) => {
		e.preventDefault();

		try {
			const response = await axiosClient.post("/login", {
				email,
				password,
			});

			// Store token and user data
			localStorage.setItem("token", response.data.token);
			localStorage.setItem("user", JSON.stringify(response.data.user));

			// Redirect based on role
			const userRole = response.data.user.role;
			if (userRole === "admin") {
				navigate("/admintransactions");
			} else {
				navigate("/");
			}
		} catch (error) {
			alert("Login failed. Please check your email and password.");
			console.error(error);
		}
	};

	return (
		<div className="login-container d-flex justify-content-center align-items-center w-100 min-vh-100 m-0">
			<div className="container-fluid shadow p-0">
				<div className="row g-0 min-vh-100">
					{/* Left Panel: Brand */}
					<div className="col-md-6 d-none d-md-flex flex-column justify-content-center align-items-center text-center p-4">
						<h3 className="brand mb-2 fs-1">Coffee Haven</h3>
						<p className="text-center p-3 mb-4 fs-4 brand-subtitle">
							Welcome Back, Sign In Again to Taste the Greatnest!
						</p>
					</div>

					{/* Right Panel: Form */}
					<div className="col-12 col-md-6 d-flex align-items-center login-right">
						<form
							className="login-form w-100  px-3 pt-4 m-3 rounded"
							onSubmit={handleLogin}
						>
							<h4 className="text-center  fs-2  mb-3 login-title">Login</h4>
							<p className="text-center mb-4">
								Welcome Back !, Coffee Haven is here to serve you{" "}
							</p>

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
								<div className="text-end">
									<a
										href="#"
										className="text-decoration-none small text-black "
									>
										Forgot Password?
									</a>
								</div>
							</div>

							<button type="submit" className="btn btn-primary w-100 mb-3">
								Login
							</button>

							<p className="text-center next-link">
								New Customer?{" "}
								<Link
									to="/register"
									className="fw-bold text-success  sign-up-link"
								>
									Sign Up Now
								</Link>
							</p>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Login;
