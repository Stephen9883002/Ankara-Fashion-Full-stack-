import ProductCard from '../product/ProductCard';

function NewArrival(props) {
	return (
		<section className="new-arrivals" id="new">
			<div className="section-title">
				<h2>New Arrivals</h2>
				<p>Fresh styles recently added to our collection.</p>
			</div>

			<div className="products-grid new-slider">
				{props.products
					.filter(
						(p) =>
							p.section === 'newarrivals' &&
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
export default NewArrival;
