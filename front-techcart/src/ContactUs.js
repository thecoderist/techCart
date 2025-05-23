import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Navbar from "./components/navbar";
import Footer from "./components/footer";

const ContactUs = () => {
	return (
		<div>
			<Navbar />
			<Container className="my-4 shadow rounded bg-white p-4">
				<Container className="mb-4 border rounded p-3 container-cart-title">
					<h3 className="mb-0 text-center text-uppercase cart-title">
						CONTACT US
					</h3>
				</Container>
				<Row className="align-items-center mb-5">
					<Col md={6}>
						<Card className="p-4 h-100">
							<h5 className="mb-3">Visit Us</h5>
							<p>
								📍 Coffee Haven
								<br />
								123 Brew Street
								<br />
								Calamba, Laguna, Philippines
							</p>
							<h5 className="mt-4 mb-3">Contact Details</h5>
							<p>
								📞 Phone: (049) 123-4567
								<br />
								📱 Mobile: +63 912 345 6789
								<br />
								📧 Email: contact@coffeehaven.ph
							</p>
							<h5 className="mt-4 mb-3">Operating Hours</h5>
							<p>
								🕒 Monday - Friday: 7:00 AM - 9:00 PM
								<br />
								🕒 Saturday - Sunday: 8:00 AM - 10:00 PM
							</p>
						</Card>
					</Col>
					<Col md={6}>
						<Card className="p-4 h-100">
							<h5 className="mb-3">Follow Us</h5>
							<p>
								🌐 Website: www.coffeehaven.ph
								<br />
								👍 Facebook: facebook.com/coffeehavenph
								<br />
								📸 Instagram: @coffeehavenph
								<br />
								🐦 Twitter: @coffeehavenph
							</p>
							<h5 className="mt-4 mb-3">Customer Support</h5>
							<p>
								For inquiries, feedback, or support, feel free to reach out to
								us through any of the channels listed above. Our team is here to
								assist you!
							</p>
						</Card>
					</Col>
				</Row>
			</Container>
			<Footer />
		</div>
	);
};

export default ContactUs;
