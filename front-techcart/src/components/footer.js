import React from "react";
import "./navbar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Footer = () => {
	return (
		<div>
			<footer
				className="text-white py-4 mt-5"
				style={{ backgroundColor: "#765827" }}
			>
				<div className="container">
					<div className="row text-center text-md-start">
						{/* Column 1: CoffeeHaven Info */}
						<div className="col-md-4 mb-4 mb-md-0">
							<h5 className="fw-bold fs-2">CoffeeHaven</h5>
							<p className="mb-1">
								Where each cup is brewed with passion and joy.
							</p>
							<p className="mb-0">123 Brew Lane, Bean City, PH 1234</p>
						</div>

						{/* Column 2: Social Media Icons */}
						<div className="col-md-4 mb-4 mb-md-0 d-flex flex-column align-items-center">
							<h5 className="fw-bold">Follow Us</h5>
							<div className="d-flex gap-3 mt-2">
								<a
									href="https://www.facebook.com"
									target="_blank"
									rel="noopener noreferrer"
									className="text-white fs-4"
								>
									<i className="bi bi-facebook"></i>
								</a>
								<a
									href="https://twitter.com"
									target="_blank"
									rel="noopener noreferrer"
									className="text-white fs-4"
								>
									<i className="bi bi-twitter"></i>
								</a>
								<a
									href="https://instagram.com"
									target="_blank"
									rel="noopener noreferrer"
									className="text-white fs-4"
								>
									<i className="bi bi-instagram"></i>
								</a>
							</div>
						</div>

						{/* Column 3: CoffeeHaven Description */}
						<div className="col-md-4 d-flex flex-column align-items-md-end align-items-center">
							<h5 className="fw-bold">Why CoffeeHaven?</h5>
							<p className="mb-0 text-md-end text-center">
								CoffeeHaven is your cozy retreat for soul-soothing coffee and
								warm moments. Let each sip brighten your day.
							</p>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default Footer;
