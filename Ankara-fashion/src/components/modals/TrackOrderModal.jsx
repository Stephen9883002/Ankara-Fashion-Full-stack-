import '../../components/modals/track-order.css';
import { useState } from 'react';
import { API_URL } from '../../config';

function TrackOrderModal(props) {
	const [orderNumberInput, setOrderNumberInput] = useState('');
	const [trackedOrder, setTrackedOrder] = useState(null);
	const [trackError, setTrackError] = useState('');
	const [isLooking, setIsLooking] = useState(false);

	function closeModal() {
		setOrderNumberInput('');
		setTrackedOrder(null);
		setTrackError('');
		props.onClose();
	}

	async function handleTrackOrder(e) {
		e.preventDefault();
		setTrackError('');
		setTrackedOrder(null);

		if (!orderNumberInput.trim()) {
			setTrackError('Please enter your order number.');
			return;
		}

		setIsLooking(true);

		try {
			const response = await fetch(`${API_URL}/orders/track`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ orderNumber: orderNumberInput.trim() }),
			});

			const data = await response.json();

			if (!response.ok) {
				setTrackError(data.error || 'Something went wrong. Please try again.');
				return;
			}

			setTrackedOrder(data);
		} catch (error) {
			console.error('Tracking error:', error);
			setTrackError('Could not reach the server. Please try again.');
		} finally {
			setIsLooking(false);
		}
	}

	if (!props.isOpen) return null;

	return (
		<div
			className="track-modal-overlay"
			onClick={(e) => {
				if (e.target === e.currentTarget) closeModal();
			}}
		>
			<div className="track-modal-container">
				{/* Modal Header */}
				<div className="track-modal-header">
					<div className="header-text">
						<h2>Track Your Order</h2>
						<p>Enter your order number to see its current status</p>
					</div>
					<button
						className="close-modal-btn"
						type="button"
						onClick={closeModal}
						aria-label="Close modal"
					>
						&times;
					</button>
				</div>

				{/* Modal Main Body */}
				<div className="track-modal-body">
					<form className="track-form" onSubmit={handleTrackOrder}>
						{/* Search Controls */}
						<div className="search-group">
							<label className="input-field-label">Order Reference ID</label>
							<div className="input-button-row">
								<input
									type="text"
									placeholder="e.g. ANK-ORDER-261013-5284060581"
									aria-label="Order number"
									value={orderNumberInput}
									onChange={(e) => setOrderNumberInput(e.target.value)}
									className="track-input-field"
								/>
								<button
									id="place-order-btn"
									type="submit"
									disabled={isLooking}
									className="track-submit-btn"
								>
									{isLooking ? (
										<span className="loading-spinner-wrapper">
											<span className="loading-dot-spinner"></span>
											Looking...
										</span>
									) : (
										'Track Order'
									)}
								</button>
							</div>
						</div>

						{/* Error Area */}
						{trackError && (
							<div className="track-error-banner" role="alert">
								<span className="error-icon">⚠️</span>
								<span className="error-text">{trackError}</span>
							</div>
						)}

						{/* Order Results Output */}
						{trackedOrder && (
							<div className="track-result-section">
								{/* Meta Overview Box */}
								<div className="order-summary-card">
									<div className="summary-field">
										<span className="field-title">Order Code</span>
										<span className="field-value order-code-font">
											{trackedOrder.order_number}
										</span>
									</div>
									<div className="summary-field">
										<span className="field-title">Current Status</span>
										<span
											className={`order-status-badge ${trackedOrder.status}`}
										>
											{trackedOrder.status}
										</span>
									</div>
									<div className="summary-field">
										<span className="field-title">Purchase Date</span>
										<span className="field-value">
											{new Date(trackedOrder.created_at).toLocaleString()}
										</span>
									</div>
									<div className="summary-field">
										<span className="field-title">Est. Delivery</span>
										<span className="field-value highlight-delivery">
											3-5 business days
										</span>
									</div>
								</div>

								{/* Items Subsection */}
								<div className="items-list-wrapper">
									<h3 className="section-subheading">Items Ordered</h3>
									<div className="product-list-container">
										{trackedOrder.items.map((item) => (
											<div className="product-item-row" key={item.id}>
												<div className="product-image-frame">
													<img src={item.image} alt={item.title} />
												</div>
												<div className="product-details-column">
													<h4>{item.title}</h4>
													<p>
														Quantity:{' '}
														<span className="weight-medium">{item.qty}</span>
													</p>
												</div>
												<div className="product-price-label">
													₦ {item.price.toLocaleString()}
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Modern Total Banner */}
								<div className="pricing-total-banner">
									<span className="total-label">Total Amount Charged</span>
									<span className="total-value">
										₦{trackedOrder.total.toLocaleString()}
									</span>
								</div>
							</div>
						)}

						{/* Privacy Notification Banner */}
						<div className="track-privacy-note">
							For your privacy, we don't show your address, phone number or
							email here. Create an account or log in to see full order details
							on future orders. Need help with this order?{' '}
							<a href="#contact" onClick={closeModal} className="support-link">
								Contact support
							</a>
							.
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

export default TrackOrderModal;
