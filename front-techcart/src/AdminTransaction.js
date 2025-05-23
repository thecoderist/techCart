import React, { useState, useEffect } from "react";
import { Table, Form, Container, Alert, Badge } from "react-bootstrap";
import AdminNavbar from "./components/adminnavbar";
import "./App.css";
import { useNavigate } from "react-router-dom";
import { InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";

const AdminTransactions = () => {
	const navigate = useNavigate();
	const [transactions, setTransactions] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterDate, setFilterDate] = useState("");
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [token, setToken] = useState(localStorage.getItem("token") || "");

	useEffect(() => {
		if (!token) {
			navigate("/login");
			return;
		}
		fetchTransactions();
	}, [token, navigate]);

	const fetchTransactions = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch("http://localhost:8000/api/orders", {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (response.status === 401) {
				localStorage.removeItem("token");
				navigate("/login");
				return;
			}
			if (!response.ok) throw new Error("Failed to fetch transactions");
			const data = await response.json();
			setTransactions(data);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const filteredTransactions = transactions.filter((item) => {
		const matchesSearch =
			String(item.order_id).toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			false ||
			item.customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			false;

		const matchesDate = filterDate
			? item.created_at.split("T")[0] === filterDate
			: true;

		// Both conditions must be true if both filters are applied
		return matchesSearch && matchesDate;
	});

	const handleSearchChange = (e) => setSearchQuery(e.target.value);
	const handleDateChange = (e) => setFilterDate(e.target.value);

	return (
		<div className="landing-page1">
			<AdminNavbar />
			<Container className="my-4 shadow rounded bg-white p-4">
				<Container className="mb-4 border rounded p-3 container-cart-title">
					<h3 className="mb-0 text-center text-uppercase cart-title">
						Admin Transactions
					</h3>
				</Container>
				{error && <Alert variant="danger">{error}</Alert>}
				{loading && <Alert variant="info">Loading...</Alert>}
				<div className="d-flex flex-column flex-md-row justify-content-md-end align-items-md-center mb-4">
					<Form.Control
						type="date"
						value={filterDate}
						onChange={handleDateChange}
						className="w-100 w-md-auto me-md-2 mb-2 mb-md-0"
						placeholder="Filter by Date"
					/>
					<InputGroup className="w-100 w-md-auto">
						<Form.Control
							type="text"
							placeholder="Search Order ID, Customer Name, or Email"
							value={searchQuery}
							onChange={handleSearchChange}
						/>
						<InputGroup.Text>
							<FaSearch />
						</InputGroup.Text>
					</InputGroup>
				</div>

				<div className="table-responsive">
					<Table bordered className="cart-table">
						<thead className="text-center">
							<tr>
								<th>Order ID</th>
								<th>Customer Details</th>
								<th>Products Ordered</th>
								<th>Total Quantity</th>
								<th>Total Amount</th>
								<th>Date & Time</th>
							</tr>
						</thead>
						<tbody>
							{filteredTransactions.length === 0 && !loading ? (
								<tr>
									<td colSpan="6" className="empty-cart-message">
										No transactions found
									</td>
								</tr>
							) : (
								filteredTransactions.map((item) => (
									<tr key={item.order_id}>
										<td>{item.order_id}</td>
										<td>
											<ul className="list-unstyled mb-0">
												<li>
													<strong>Name:</strong>{" "}
													{item.customer.name || "Not provided"}
												</li>
												<li>
													<strong>Email:</strong>{" "}
													{item.customer.email || "Not provided"}
												</li>
												<li>
													<strong>Address:</strong>{" "}
													{item.customer.address || "Not provided"}
												</li>
												<li>
													<strong>Contact:</strong>{" "}
													{item.customer.contact || "Not provided"}
												</li>
												<li>
													<strong>Birthday:</strong>{" "}
													{item.customer.birthday || "Not provided"}
												</li>
												<li>
													<strong>Gender:</strong>{" "}
													{item.customer.gender
														? item.customer.gender.charAt(0).toUpperCase() +
														  item.customer.gender.slice(1)
														: "Not provided"}
												</li>
											</ul>
										</td>
										<td>
											<ul className="list-unstyled mb-0">
												{item.items.map((product, index) => (
													<li key={index}>
														<strong>{product.product_name}</strong>
														<ul>
															<li>Quantity: {product.quantity}</li>
															<li>
																Price per Item: P
																{product.price
																	? Number(product.price).toLocaleString(
																			"en-PH",
																			{
																				minimumFractionDigits: 2,
																			}
																	  )
																	: "N/A"}
															</li>
															<li>
																Subtotal: P
																{(
																	product.quantity * product.price
																).toLocaleString("en-PH", {
																	minimumFractionDigits: 2,
																})}
															</li>
														</ul>
													</li>
												))}
											</ul>
										</td>
										<td>
											<Badge bg="info">
												{item.items.reduce(
													(total, product) => total + product.quantity,
													0
												)}
											</Badge>
										</td>
										<td>
											<strong>
												P
												{item.total.toLocaleString("en-PH", {
													minimumFractionDigits: 2,
												})}
											</strong>
										</td>
										<td>
											{new Date(item.created_at).toLocaleString("en-PH", {
												dateStyle: "medium",
												timeStyle: "short",
											})}
										</td>
									</tr>
								))
							)}
						</tbody>
					</Table>
				</div>
			</Container>
		</div>
	);
};

export default AdminTransactions;
