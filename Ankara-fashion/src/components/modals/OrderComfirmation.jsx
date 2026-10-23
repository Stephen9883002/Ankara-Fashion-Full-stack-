//

import './checkout-modal.css';

function OrderComfirmation(props) {
	if (!props.order) return null;

	const orderNumber = props.order.order_number;
	const orderDate = new Date(props.order.created_at).toLocaleString();

	// return (
	// 	<div
	// 		className="ankara-modal-overlay-bg is-active-view"
	// 		onClick={(e) => {
	// 			if (e.target === e.currentTarget) props.onClose();
	// 		}}
	// 	>
	// 		<div className="ankara-checkout-modal-box ankara-success-max-width">
	// 			{/* Top Hero Banner Banner */}
	// 			<div className="ankara-checkout-top-banner ankara-success-hero-bg">
	// 				<button
	// 					className="ankara-checkout-dismiss-btn"
	// 					type="button"
	// 					onClick={props.onClose}
	// 				>
	// 					&times;
	// 				</button>
	// 				<div className="success-header-wrapper">
	// 					<div className="success-check-badge">✔</div>
	// 					<div>
	// 						<h2>Order Confirmed</h2>
	// 						<p>Thank You, {props.order.full_name}</p>
	// 					</div>
	// 				</div>
	// 			</div>

	// 			{/* Body Content Wrapper */}
	// 			<div className="ankara-success-body-content">
	// 				{/* Logistics & Tracking Meta Card */}
	// 				<div className="success-details-list-card">
	// 					<div className="success-meta-row">
	// 						<span className="success-meta-label">Order Reference</span>
	// 						<strong className="success-meta-value highlight-ref">
	// 							{orderNumber}
	// 						</strong>
	// 					</div>
	// 					<div className="success-meta-row">
	// 						<span className="success-meta-label">Date Placed</span>
	// 						<span className="success-meta-value">{orderDate}</span>
	// 					</div>
	// 					<div className="success-meta-row">
	// 						<span className="success-meta-label">Estimated Delivery</span>
	// 						<span className="success-meta-value delivery-accent">
	// 							2-3 business days
	// 						</span>
	// 					</div>
	// 				</div>

	// 				{/* Itemized Manifest Section */}
	// 				<h3 className="success-section-title-label">Purchased Manifest</h3>

	// 				<div className="success-items-stack-loop">
	// 					{props.order.items.map((item) => (
	// 						<div
	// 							className="ankara-checkout-item-row success-item-padding"
	// 							key={item.id}
	// 						>
	// 							<div className="ankara-checkout-img-box">
	// 								<img src={item.image} alt={item.title} />
	// 							</div>
	// 							<div className="ankara-checkout-item-info">
	// 								<strong>{item.title}</strong>
	// 								<p className="ankara-checkout-item-pricing">
	// 									Qty: {item.qty} &mdash; ₦{item.price.toLocaleString()}
	// 								</p>
	// 							</div>
	// 							<span className="success-line-calculated-total">
	// 								₦{(item.price * item.qty).toLocaleString()}
	// 							</span>
	// 						</div>
	// 					))}
	// 				</div>

	// 				{/* Bottom Total Summary Bar */}
	// 				<div className="ankara-checkout-total-banner success-total-margin">
	// 					<span>Total Charged</span>
	// 					<strong>₦{props.order.total.toLocaleString()}</strong>
	// 				</div>

	// 				{/* Primary Call-to-action Button */}
	// 				<button
	// 					className="ankara-checkout-action-btn"
	// 					type="button"
	// 					onClick={props.onClose}
	// 				>
	// 					Continue Shopping
	// 				</button>
	// 			</div>
	// 		</div>
	// 	</div>
	// );
	return (
		<div
			className="ankara-modal-overlay-bg is-active-view"
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100vw',
				height: '100vh',
				backgroundColor: 'rgba(0, 0, 0, 0.65)',
				backdropFilter: 'blur(4px)',
				display: 'flex',
				alignItems:
					'flex-start' /* Drops modal down slightly so the header isn't cut off */,
				justifyContent: 'center',
				padding: '2.5rem 1rem',
				overflowY: 'auto' /* Forces layout page scroll ability */,
				zIndex: 99999999 /* Ultimate z-index height override to beat the Navbar */,
				pointerEvents: 'auto',
			}}
			onClick={(e) => {
				if (e.target === e.currentTarget) props.onClose();
			}}
		>
			<div
				className="ankara-checkout-modal-box ankara-success-max-width"
				style={{
					background: '#ffffff',
					borderRadius: '16px',
					width: '100%',
					maxWidth: '550px',
					boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
					overflow: 'hidden',
					margin: 'auto',
				}}
			>
				{/* Top Hero Banner Banner */}
				<div className="ankara-checkout-top-banner ankara-success-hero-bg">
					<button
						className="ankara-checkout-dismiss-btn"
						type="button"
						onClick={props.onClose}
					>
						&times;
					</button>
					<div className="success-header-wrapper">
						<div className="success-check-badge">✔</div>
						<div>
							<h2>Order Confirmed</h2>
							<p>Thank You, {props.order.full_name}</p>
						</div>
					</div>
				</div>

				{/* Body Content Wrapper */}
				<div className="ankara-success-body-content">
					{/* Logistics & Tracking Meta Card */}
					<div className="success-details-list-card">
						<div className="success-meta-row">
							<span className="success-meta-label">Order Number</span>
							<strong className="success-meta-value highlight-ref">
								{orderNumber}
							</strong>
						</div>
						<div className="success-meta-row">
							<span className="success-meta-label">Date Placed</span>
							<span className="success-meta-value">{orderDate}</span>
						</div>
						<div className="success-meta-row">
							<span className="success-meta-label">Estimated Delivery</span>
							<span className="success-meta-value delivery-accent">
								2-3 business days
							</span>
						</div>
					</div>

					{/* Itemized Manifest Section */}
					<h3 className="success-section-title-label">Purchased Manifest</h3>

					{/* Added inline overflow restriction directly on the items list container */}
					<div
						className="success-items-stack-loop"
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '0.75rem',
							maxHeight: '160px' /* Maximum boundary size limits */,
							overflowY: 'auto' /* Internal manifest scrolling activation */,
							paddingRight: '0.5rem',
							marginBottom: '1.5rem',
						}}
					>
						{props.order.items.map((item) => (
							<div
								className="ankara-checkout-item-row success-item-padding"
								key={item.id}
							>
								<div className="ankara-checkout-img-box">
									<img src={item.image} alt={item.title} />
								</div>
								<div className="ankara-checkout-item-info">
									<strong>{item.title}</strong>
									<p className="ankara-checkout-item-pricing">
										Qty: {item.qty} &mdash; ₦{item.price.toLocaleString()}
									</p>
								</div>
								<span className="success-line-calculated-total">
									₦{(item.price * item.qty).toLocaleString()}
								</span>
							</div>
						))}
					</div>

					{/* Bottom Total Summary Bar */}
					<div className="ankara-checkout-total-banner success-total-margin">
						<span>Total Charged + free Delivery</span>
						<strong>₦{props.order.total.toLocaleString()}</strong>
					</div>

					{/* Primary Call-to-action Button */}
					<button
						className="ankara-checkout-action-btn"
						type="button"
						onClick={props.onClose}
					>
						Continue Shopping
					</button>
				</div>
			</div>
		</div>
	);
}

export default OrderComfirmation;
