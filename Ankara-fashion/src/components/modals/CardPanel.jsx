function CardPanel(props) {
	return (
		<div
			id="cart-panel"
			className={`cart-panel ${props.isCartOpen ? 'active' : ''}`}
			aria-live="polite"
			style={{ zIndex: 100000000 }}
		>
			<div className="cart-header">
				<h2>Your Cart</h2>
				<button
					type="button"
					aria-label="Close cart"
					onClick={props.onToggleCart}
				>
					✖
				</button>
			</div>
			<div id="cart-items">
				{props.cartItems.map((item) => (
					<div className="cart-item" key={item.id}>
						<img src={item.image} alt={item.title} />
						<div className="cart-info">
							<h3>{item.title}</h3>
							<p>₦{item.price.toLocaleString()}</p>
							<div className="qty-controls">
								<button
									type="button"
									className="qty-btn minus"
									onClick={() => props.onDecreaseQty(item.id)}
								>
									-
								</button>
								<span className="qty">{item.qty}</span>
								<button
									type="button"
									className="qty-btn plus"
									onClick={() => props.onIncreaseQty(item.id)}
								>
									+
								</button>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* 
				<div id="cart-items" ></div>
			))} */}
			<div className="cart-footer">
				<h3>
					Total:{' '}
					<span id="cart-total">₦{props.cartTotal.toLocaleString()}</span>
				</h3>
				<button id="checkoutBtn" type="button" onClick={props.onOpenCheckout}>
					Checkout
				</button>
			</div>
		</div>
	);
}
export default CardPanel;
