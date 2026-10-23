function ProductCard(props) {
	const soldOut = props.statusClass === 'sold-out';
	return (
		<article className="product-card" id={`product-${props.productId}`}>
			<span className={`status ${props.statusClass}`}>{props.statusText}</span>
			<img src={props.image} alt={props.title} />
			<h3>{props.title}</h3>
			<p className="price">₦{props.price.toLocaleString()}</p>
			<div className="product-buttons">
				<button
					className="buy-btn"
					type="button"
					onClick={props.onBuyNow}
					disabled={soldOut}
				>
					Buy Now
				</button>
				<button
					className="cart-btn"
					type="button"
					onClick={props.onAddToCart}
					disabled={soldOut}
				>
					Add To Cart
				</button>
			</div>
		</article>
	);
}
export default ProductCard;
