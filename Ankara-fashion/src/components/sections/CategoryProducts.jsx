import { useRef, useEffect } from 'react';
import ProductCard from '../product/ProductCard';

function CategoryProducts(props) {
	const dressesRef = useRef(null);
	const bagsRef = useRef(null);
	const jewelryRef = useRef(null);
	const nativesRef = useRef(null);

	const sectionRefs = {
		dresses: dressesRef,
		'hand bag': bagsRef,
		jewelry: jewelryRef,
		natives: nativesRef,
	};
	useEffect(() => {
		const target = sectionRefs[props.activeCategory];
		if (target && target.current) {
			target.current.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			});
		}
	}, [props.scrollSignal]);

	return (
		<section className="category-products" aria-label="Category collections">
			<section
				id="dresses"
				ref={dressesRef}
				className={`product-section ${props.activeCategory === 'dresses' ? 'active' : ''}`}
			>
				<h2>Elegant Dress Collections</h2>
				<div className="product-grid">
					{props.products
						.filter(
							(p) =>
								p.section === 'category' &&
								p.category === 'dresses' &&
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

			<section
				id="hand bag"
				ref={bagsRef}
				className={`product-section ${props.activeCategory === 'hand bag' ? 'active' : ''}`}
			>
				<h2>Hand Bags Collection</h2>
				<div className="product-grid">
					{props.products
						.filter(
							(p) =>
								p.section === 'category' &&
								p.category === 'hand bag' &&
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

			<section
				id="jewelry"
				ref={jewelryRef}
				className={`product-section ${props.activeCategory === 'jewelry' ? 'active' : ''}`}
			>
				<h2>Jewelry Collection</h2>
				<div className="product-grid">
					{props.products
						.filter(
							(p) =>
								p.section === 'category' &&
								p.category === 'jewelry' &&
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

			<section
				id="natives"
				ref={nativesRef}
				className={`product-section ${props.activeCategory === 'natives' ? 'active' : ''}`}
			>
				<h2>Natives Collections</h2>
				<div className="product-grid">
					{props.products
						.filter(
							(p) =>
								p.section === 'category' &&
								p.category === 'natives' &&
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
		</section>
	);
}
export default CategoryProducts;
