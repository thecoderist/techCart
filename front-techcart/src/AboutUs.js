import React from "react";
import { Container, Row, Col, Image } from "react-bootstrap";
import Navbar from "./components/navbar";
import Footer from "./components/footer";

const AboutUs = () => {
	return (
		<div>
			<Navbar />
			<Container className="my-4 shadow rounded bg-white p-4">
				<Container className="mb-4 border rounded p-3 container-cart-title">
					<h3 className="mb-0 text-center text-uppercase cart-title">
						ABOUT US
					</h3>
				</Container>
				<Row className="align-items-center mb-5">
					<Col md={6}>
						<Image
							src="banner1.jpg"
							alt="Coffee Haven Shop"
							fluid
							rounded
						/>
					</Col>
					<Col md={6}>
						<p>
							Welcome to Coffee Haven, your cozy corner for the finest brews and
							delightful pastries. Our journey began with a passion for coffee
							and a dream to create a haven for coffee enthusiasts.
						</p>
						<p>
							At Coffee Haven, we believe in sourcing the best beans and
							crafting each cup with love. Join us for a warm ambiance, friendly
							faces, and an unforgettable coffee experience.
						</p>
					</Col>
				</Row>
				<Row>
					<Col md={4}>
						<Image src="products1.jpg" alt="Espresso" fluid rounded />
					</Col>
					<Col md={4}>
						<Image src="products2.jpg" alt="Latte Art" fluid rounded />
					</Col>
					<Col md={4}>
						<Image
							src="products6.jpg"
							alt="Coffee Beans"
							fluid
							rounded
						/>
					</Col>
				</Row>
			</Container>
			<Footer />
		</div>
	);
};

export default AboutUs;
