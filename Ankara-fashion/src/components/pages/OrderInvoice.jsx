function OrderInvoice(props) {
	const order = props.order;

	function imageSrc(path) {
		return path && path.startsWith('./') ? path.slice(1) : path;
	}

	return (
		<div className="account-invoice-panel">
			{/* Action Header Nav */}
			<div className="account-invoice-nav">
				<button
					className="account-invoice-back-action"
					type="button"
					onClickCapture={props.onBack}
				>
					&larr; Back to Orders
				</button>
			</div>

			{/* Invoice Top Hero Area */}
			<div className="account-invoice-hero">
				<div>
					<h2>Order {order.order_number}</h2>
					<p className="hero-timestamp">
						{new Date(order.created_at).toLocaleString()}
					</p>
				</div>
				<span
					className={`account-status-pill-flag ${order.status ? order.status.toLowerCase() : ''}`}
				>
					{order.status}
				</span>
			</div>

			{/* Responsive Two-Column Details Matrix Layout */}
			<div className="account-invoice-split-layout">
				{/* Left Column: Customer and Logistic Metadata Cards */}
				<div className="account-invoice-meta-column">
					<div className="account-invoice-info-card">
						<span className="card-meta-caption-title">
							Delivery Destination
						</span>
						<p className="card-meta-primary-content">{order.address}</p>
					</div>

					<div className="account-invoice-info-card">
						<span className="card-meta-caption-title">Customer Identity</span>
						<p className="card-meta-primary-content font-semibold">
							<strong>Name:-</strong> {order.full_name}
						</p>
						<p className="card-meta-secondary-content">
							<strong>Email:-</strong>
							<label htmlFor="email"> {order.email}</label>
						</p>
						<p className="card-meta-secondary-content">
							<strong>Phone:-</strong>
							<label htmlFor="phoen">{order.phone}</label>
						</p>
					</div>
				</div>

				{/* Right Column: Dynamic Line Items Manifest & Financial Summaries */}
				<div className="account-invoice-items-column">
					<div className="account-invoice-manifest-card">
						<h3 className="manifest-block-heading">Purchased Items</h3>

						<div className="manifest-items-loop-stack">
							{order.items &&
								order.items.map((item) => (
									<div className="manifest-line-item-row" key={item.id}>
										<div className="manifest-img-frame">
											{/* <img src={item.image} alt={item.title} /> */}
											<img src={imageSrc(item.image)} alt={item.title} />
										</div>

										<div className="manifest-item-description">
											<strong className="manifest-item-title-name">
												{item.title}
											</strong>
											<p className="manifest-item-unit-pricing">
												Qty: {item.qty} × ₦{item.price.toLocaleString()}
											</p>
										</div>

										<span className="manifest-calculated-line-total">
											₦{(item.price * item.qty).toLocaleString()}
										</span>
									</div>
								))}
						</div>

						{/* Bottom Pricing Summary Strip */}
						<div className="manifest-pricing-summary-aggregate">
							<span className="aggregate-label">
								Total Paid + free Delivery
							</span>
							<strong className="aggregate-numeric-value">
								₦{order.total.toLocaleString()}
							</strong>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default OrderInvoice;
