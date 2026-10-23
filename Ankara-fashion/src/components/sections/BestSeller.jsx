import ProductCard from '../product/ProductCard';

function BestSeller(props) {
	return (
		<section className="best-sellers" id="best-sellers">
			<div className="section-title">
				<h2>Best Sellers</h2>
				<p>Discover the products our customers love the most.</p>
			</div>

			<div className="products-grid best-slider">
				{props.products
					.filter(
						(p) =>
							p.section === 'bestsellers' &&
							p.title.toLowerCase().includes(props.searchTerm.toLowerCase()),
					)
					.map((p) => (
						<ProductCard
							key={p.id}
							onAddToCart={() => props.onAddToCart(p)}
							productId={p.id}
							title={p.title}
							price={p.price}
							image={p.image}
							statusText={p.statusText}
							statusClass={p.statusClass}
							onBuyNow={() => props.onBuyNow(p)}
						/>
					))}
			</div>
		</section>
	);
}
export default BestSeller;
