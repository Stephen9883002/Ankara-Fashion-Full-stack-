function Footer() {
	return (
		<footer id="contact">
			<div className="footer-container">
				<div className="footer-brand">
					<h3>Ankara Fashion</h3>
					<p>
						Discover premium fashion pieces, accessories and handbags designed
						for confidence and elegance.
					</p>
				</div>

				<div className="footer-links">
					<h4>Quick Links</h4>
					<ul>
						<li>
							<a href="#hero">Home</a>
						</li>
						<li>
							<a href="#categories">Categories</a>
						</li>
						<li>
							<a href="#featured">Collections</a>
						</li>
						<li>
							<a href="#about">About</a>
						</li>
						<li>
							<a href="#contact">Contact</a>
						</li>
					</ul>
				</div>

				<div className="footer-info">
					<h4>Contact Us</h4>
					<p>Email: support@ankarafashion.com</p>
					<p>Phone: +234-555-555-555</p>
					<p>41 Layi Yusuf Cres, Lekki Phase 1</p>
					<div className="social-icons">
						<a href="#" aria-label="Instagram">
							<img src="./img/insta.PNG" alt="Instagram" />
						</a>
						<a href="#" aria-label="Facebook">
							<img src="./img/fb.WEBP" alt="Facebook" />
						</a>
						<a href="#" aria-label="TikTok">
							<img src="./img/tik.PNG" alt="TikTok" />
						</a>
					</div>
				</div>
			</div>

			<div className="footer-bottom">
				<p>© 2026 Ankara Fashion. All Rights Reserved.</p>
			</div>
		</footer>
	);
}
export default Footer;
