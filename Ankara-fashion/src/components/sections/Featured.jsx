import ProductCard from '../product/ProductCard';
// import product from '../../data/product';

function Featured(props) {
	return (
		<section className="featured-products" id="featured">
			<div className="section-title">
				<h2>Featured Collection</h2>
				<p>Trending pieces selected for this season.</p>
			</div>

			<div className="products-grid featured-slider">
				{props.products
					.filter(
						(p) =>
							p.section === 'featured' &&
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
export default Featured;
