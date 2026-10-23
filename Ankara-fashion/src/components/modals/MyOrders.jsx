import { useState, useEffect } from 'react';
import { API_URL } from '../../config'; // Double-check the relative path to config.js

function MyOrdersModal(props) {
	const [orders, setOrders] = useState([]);
	const [loadError, setLoadError] = useState('');

	useEffect(() => {
		if (!props.isOpen) return;

		async function loadMyOrders() {
			setLoadError('');

			try {
				const response = await fetch(`${API_URL}/my-orders`, {
					headers: { Authorization: `Bearer ${props.authToken}` },
				});

				if (!response.ok) throw new Error('Failed to load orders');

				const data = await response.json();
				setOrders(data);
			} catch (error) {
				console.error('Error loading orders:', error);
				setLoadError('Could not load your orders. Please try again.');
			}
		}

		loadMyOrders();
	}, [props.isOpen, props.authToken]);

	if (!props.isOpen) return null;

	return (
		<div
			className="payment-modal is-open"
			onClick={(e) => {
				if (e.target === e.currentTarget) props.onClose();
			}}
		>
			<div className="checkout-container">
				<div className="checkout-header">
					<button className="close-modal" type="button" onClick={props.onClose}>
						&times;
					</button>
					<h2>My Orders</h2>
				</div>

				<div
					style={{ padding: '1.5rem', maxHeight: '500px', overflowY: 'auto' }}
				>
					{loadError && (
						<p style={{ color: '#b63636', fontWeight: 600 }}>{loadError}</p>
					)}

					{orders.length === 0 && !loadError && <p>You have no orders yet.</p>}

					{orders.map((order) => (
						<div
							key={order.id}
							style={{ borderBottom: '1px solid #eee', padding: '1rem 0' }}
						>
							<p>
								<strong>Order:</strong> ANK-ORDER-
								{String(order.id).padStart(9, '0')}
							</p>
							<p>
								<strong>Status:</strong> {order.status}
							</p>
							<p>
								<strong>Date:</strong>{' '}
								{new Date(order.created_at).toLocaleString()}
							</p>
							<p>
								<strong>Total:</strong> ₦{order.total.toLocaleString()}
							</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default MyOrdersModal;
