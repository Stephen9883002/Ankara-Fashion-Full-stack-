import TrustCard from './TrustCard.jsx';

function TrustSection() {
	return (
		<section className="trust-section" id="reviews">
			<div className="section-title">
				<h2>Shop With Confidence</h2>
				<p>Your satisfaction and security are our priority.</p>
			</div>

			<div className="trust-grid">
				<TrustCard
					icon="🔒"
					title="Secure Payments"
					description="Protected transactions with trusted payment methods."
				/>
				<TrustCard
					icon="🚚"
					title="Fast Delivery"
					description="Reliable shipping to your doorstep"
				/>
				<TrustCard
					icon="↩️"
					title="Fast Return"
					description="Hassle-free return process for eligible products."
				/>
				<TrustCard
					icon="⭐"
					title="Quality Guaranteed"
					description="Carefully selected fashion pieces and accessories."
				/>
			</div>
		</section>
	);
}
export default TrustSection;
