import React from "react";
import { Container, Navbar, Nav } from "react-bootstrap";
import { FaShoppingCart, FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";
import { useCart } from "../context/CartContext";

const NavbarComponent = () => {
	const navigate = useNavigate();
	const { cartItems } = useCart();

	const totalItems = cartItems.reduce((total, item) => total + item.qty, 0);

	const handleLogout = async () => {
		try {
			await axiosClient.post("/logout");
		} catch (error) {
			console.error(
				"Logout error:",
				error.response?.status,
				error.response?.data
			);
		} finally {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			navigate("/login");
		}
	};

	return (
		<Navbar
			expand="lg"
			className="navbar-custom py-3 bg-body-tertiary sticky-top"
		>
			<Container fluid>
				{/* Brand */}
				<Link to="/" className="text-decoration-none d-flex align-items-center">
					<Navbar.Brand className="brand-logo mb-0">
						<h5 className="fs-2 mb-0">Coffee Haven</h5>
					</Navbar.Brand>
				</Link>

				<Navbar.Toggle aria-controls="navbarSupportedContent" />
				<Navbar.Collapse id="navbarSupportedContent">
					<div className="d-flex w-100 align-items-center justify-content-between">
						<Nav className="mx-auto">
							<Nav.Link
								as={Link}
								to="/"
								className="nav-link active "
								aria-current="page"
							>
								Homepage
							</Nav.Link>
							<Nav.Link as={Link} to="/about" className="nav-link active px-3 ">
								About Me
							</Nav.Link>
							<Nav.Link
								as={Link}
								to="/contactus"
								className="nav-link active  px-3"
							>
								Contact Us
							</Nav.Link>
						</Nav>

						<div className="d-flex align-items-center">
							<Link
								to="/cart"
								className="text-decoration-none position-relative me-3 text-white"
							>
								<FaShoppingCart
									className="icon fs-4"
									style={{ color: "white" }}
								/>
								{totalItems > 0 && (
									<span className="cart-badge">{totalItems}</span>
								)}
							</Link>

							<button
								onClick={handleLogout}
								className="btn btn-link text-white text-decoration-none p-0 fs-4"
								aria-label="Logout"
								title="Logout"
								style={{ textDecoration: "none" }}
							>
								<FaSignOutAlt />
							</button>
						</div>
					</div>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};

export default NavbarComponent;
