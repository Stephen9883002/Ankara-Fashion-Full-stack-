import '../../components/modals/checkout-modal.css';

import { useState, useRef, useEffect } from 'react';
import { API_URL } from '../../config';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function CheckoutModal(props) {
	const fullNameRef = useRef(null);
	const emailRef = useRef(null);
	const phoneRef = useRef(null);
	const addressRef = useRef(null);
	const paymentCompleteRef = useRef(false);
	const [checkoutError, setCheckoutError] = useState('');
	const [isProcessing, setIsProcessing] = useState(false);

	const displayTotal = props.checkoutItems.reduce(
		(sum, item) => sum + item.price * item.qty,
		0,
	);

	useEffect(() => {
		if (props.isCheckoutOpen) {
			setCheckoutError('');
			setIsProcessing(false);
		}
	}, [props.isCheckoutOpen]);

	const handlePaymentSuccess = async (response) => {
		paymentCompleteRef.current = true;

		try {
			const verifyRes = await fetch(
				`${API_URL}/verify-payment/${response.reference}`,
			);
			const verifyData = await verifyRes.json();

			if (!verifyRes.ok || !verifyData.verified) {
				console.error('Verification failed:', verifyRes.status, verifyData);
				setCheckoutError(
					'We could not confirm your payment yet. If you were charged, contact support with reference ' +
						response.reference +
						'.',
				);
				return;
			}

			if (verifyData.needsAttention) {
				setCheckoutError(
					'Payment received, but an item sold out while you were paying. Our team will contact you about a refund or replacement. Reference: ' +
						response.reference,
				);
				return;
			}

			// undefined (prop not wired yet) counts as a cart checkout
			if (props.checkoutFromCart !== false) props.onClearCart();
			props.onOrderComplete(verifyData.order);
			props.onClose();
		} catch (error) {
			console.error('Error confirming order:', error);
			setCheckoutError(
				'Payment received but confirmation failed. Please contact support with reference ' +
					response.reference +
					'.',
			);
		} finally {
			setIsProcessing(false);
		}
	};

	const handlePaystackPayment = async () => {
		const fullName = fullNameRef.current.value.trim();
		const email = emailRef.current.value.trim();
		const phone = phoneRef.current.value.trim();
		const address = addressRef.current.value.trim();

		if (!fullName || !email || !phone || !address) {
			setCheckoutError(
				'Please fill in your full name, email, phone, and address before paying.',
			);
			return;
		}

		if (!EMAIL_PATTERN.test(email)) {
			setCheckoutError(
				'Please enter a valid email address, like name@example.com.',
			);
			return;
		}

		if (!window.PaystackPop || typeof window.PaystackPop.setup !== 'function') {
			setCheckoutError(
				'The payment library is still loading. Please try again in a moment.',
			);
			return;
		}

		setCheckoutError('');
		setIsProcessing(true);
		paymentCompleteRef.current = false;

		try {
			const checkoutRes = await fetch(`${API_URL}/checkout`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...(props.authToken
						? { Authorization: `Bearer ${props.authToken}` }
						: {}),
				},
				body: JSON.stringify({
					fullName,
					email,
					phone,
					address,
					items: props.checkoutItems.map((item) => ({
						productId: item.id,
						qty: item.qty,
					})),
				}),
			});

			const checkoutData = await checkoutRes.json();

			if (!checkoutRes.ok) {
				setCheckoutError(
					checkoutData.error || 'Could not start your order. Please try again.',
				);
				setIsProcessing(false);
				return;
			}

			const handler = window.PaystackPop.setup({
				key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
				email: checkoutData.email,
				amount: checkoutData.amount * 100,
				currency: 'NGN',
				ref: checkoutData.reference,
				callback: (response) => handlePaymentSuccess(response),
				onClose: () => {
					if (paymentCompleteRef.current) return;
					setIsProcessing(false);
					setCheckoutError('Payment was not completed.');
				},
			});

			handler.openIframe();
		} catch (error) {
			console.error('Checkout error:', error);
			setCheckoutError('Could not reach the server. Please try again.');
			setIsProcessing(false);
		}
	};

	return (
		<section id="checkout-section" className="ankara-modal-global-scope">
			<div
				className={`ankara-modal-overlay-bg ${props.isCheckoutOpen ? 'is-active-view' : ''}`}
				aria-hidden={props.isCheckoutOpen ? 'false' : 'true'}
				onClick={(e) => {
					if (e.target === e.currentTarget) props.onClose();
				}}
			>
				<div className="ankara-checkout-modal-box">
					{/* Modal Title Header Banner */}
					<div className="ankara-checkout-top-banner">
						<button
							className="ankara-checkout-dismiss-btn"
							type="button"
							aria-label="Close checkout"
							onClick={props.onClose}
						>
							&times;
						</button>
						<h2>Secure Checkout</h2>
						<p>Pay securely with Paystack</p>
					</div>

					{/* Layout Architecture Matrix */}
					<div className="ankara-checkout-master-grid">
						{/* Column 1: Billing Input Elements Wrapper */}
						<div className="ankara-checkout-section-panel">
							<h3>Billing Details</h3>
							<div className="ankara-checkout-input-stack">
								<input
									type="text"
									className="ankara-checkout-text-field"
									placeholder="Full Name"
									aria-label="Full Name"
									ref={fullNameRef}
								/>
								<input
									type="email"
									className="ankara-checkout-text-field"
									placeholder="Email Address"
									aria-label="Email Address"
									ref={emailRef}
								/>
								<input
									type="tel"
									className="ankara-checkout-text-field"
									placeholder="Phone Number"
									aria-label="Phone Number"
									ref={phoneRef}
								/>
								<input
									type="text"
									className="ankara-checkout-text-field"
									placeholder="Delivery Address"
									aria-label="Delivery Address"
									ref={addressRef}
								/>
							</div>
						</div>

						{/* Column 2: Alternative Bank Transfer Panel */}
						<div className="ankara-checkout-section-panel">
							<div className="ankara-checkout-badge-label unavailable">
								❌ Not Available
							</div>
							<h3>Bank Transfer</h3>

							<div className="ankara-checkout-bank-details">
								<p>
									<strong>Bank:</strong> GTBank
								</p>
								<p>
									<strong>Account Name:</strong> Ankara Fashion
								</p>
								<p>
									<strong>Account Number:</strong> Not Available
								</p>
								<p className="ankara-checkout-notice-text">
									After successful payment, order confirmation will be sent to
									the email address provided with your order number.
								</p>
							</div>

							<div
								className="ankara-checkout-input-stack"
								style={{ marginTop: 'auto', paddingTop: '1rem' }}
							>
								<input
									type="text"
									className="ankara-checkout-text-field"
									placeholder="Reference Number"
									aria-label="Reference"
								/>
							</div>
						</div>

						{/* Column 3: Cart Breakdown Manifest Card */}
						<div className="ankara-checkout-section-panel">
							<div className="ankara-checkout-badge-label recommended">
								Recommended ✔
							</div>
							<h3>Order Summary</h3>

							<div className="ankara-checkout-items-stack">
								{props.checkoutItems &&
									props.checkoutItems.map((item) => (
										<div className="ankara-checkout-item-row" key={item.id}>
											<div className="ankara-checkout-img-box">
												<img src={item.image} alt={item.title} />
											</div>
											<div className="ankara-checkout-item-info">
												<strong>{item.title}</strong>
												<p className="ankara-checkout-item-pricing">
													Qty: {item.qty} &mdash; ₦{item.price.toLocaleString()}
												</p>
											</div>
										</div>
									))}
							</div>

							<div className="ankara-checkout-total-banner">
								<span>Total Amount + free Delivery:</span>
								<strong>₦{displayTotal.toLocaleString()}</strong>
							</div>

							{checkoutError && (
								<div className="ankara-checkout-error-panel" role="alert">
									{checkoutError}
								</div>
							)}

							<button
								className="ankara-checkout-action-btn"
								type="button"
								onClick={handlePaystackPayment}
								disabled={isProcessing}
							>
								{isProcessing ? 'Processing...' : 'Pay with Paystack'}
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default CheckoutModal;
