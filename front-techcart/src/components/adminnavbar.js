import React from "react";
import { Container, Navbar, Nav } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";
import "../components/navbar.css";
import { FaSignOutAlt } from "react-icons/fa";

const NavbarComponent = () => {
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) {
				navigate("/login", { replace: true });
				return;
			}
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			await axiosClient.post("/logout");
		} catch (error) {
			console.error("Logout error:", error.response?.data || error.message);
		} finally {
			navigate("/login", { replace: true });
		}
	};

	return (
		<Navbar
			expand="lg"
			className="navbar-custom py-3 bg-body-tertiary sticky-top"
		>
			<Container fluid>
				{/* Brand */}
				<Link
					to="/adminproducts"
					className="text-decoration-none d-flex align-items-center"
				>
					<Navbar.Brand className="brand-logo mb-0">
						<h5 className="fs-2 mb-0">Coffee Haven</h5>
					</Navbar.Brand>
				</Link>

				<Navbar.Toggle aria-controls="admin-navbar-nav" />
				<Navbar.Collapse id="admin-navbar-nav">
					<div className="d-flex w-100 align-items-center justify-content-between">
						<Nav className="mx-auto">
							<Nav.Link
								as={Link}
								to="/adminproducts"
								className="nav-link active px-3 text-dark"
							>
								Manage Products
							</Nav.Link>
							<Nav.Link
								as={Link}
								to="/admintransactions"
								className="nav-link active px-3 text-dark"
							>
								Transactions
							</Nav.Link>
						</Nav>

						<div className="d-flex align-items-center">
							<button
								onClick={handleLogout}
								className="btn btn-link text-dark text-decoration-none p-0 fs-4"
								aria-label="Logout"
								title="Logout"
								style={{ textDecoration: "none" }}
							>
								<FaSignOutAlt style={{ color: "white" }} />
							</button>
						</div>
					</div>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};

export default NavbarComponent;
