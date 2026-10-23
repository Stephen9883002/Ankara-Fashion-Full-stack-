import FeatureCard from './FeatureCard';

function WhyUs() {
	return (
		<section className="why-us">
			<div className="section-title">
				<h2>Why Shop With Us</h2>
				<p>We are committed to quality, style and customer satisfaction.</p>
			</div>

			<div className="features-grid">
				<FeatureCard
					title="Premium Quality"
					description="Every item is carefully selected to meet our quality standards."
				/>
				<FeatureCard
					title="Fast Delivery"
					description="Quick and reliable delivery to ensure your order arrives safely."
				/>
				<FeatureCard
					title="Secure Ordering"
					description="A simple and trusted ordering process for all customers."
				/>
				<FeatureCard
					title="Customer Support"
					description="Friendly assistance through WhatsApp and social media channels."
				/>
			</div>
		</section>
	);
}
export default WhyUs;
