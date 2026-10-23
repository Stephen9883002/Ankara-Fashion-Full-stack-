import { useState, useEffect } from 'react';
import OrderInvoice from './OrderInvoice';

function AccountOrders(props) {
	const [orders, setOrders] = useState([]);
	const [loadError, setLoadError] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [selectedOrder, setSelectedOrder] = useState(null);

	useEffect(() => {
		if (!props.authToken) return;

		async function loadOrders() {
			setLoadError('');
			setIsLoading(true);

			try {
				const response = await fetch('http://localhost:3000/my-orders', {
					headers: { Authorization: `Bearer ${props.authToken}` },
				});

				if (!response.ok) {
					console.error('GET /my-orders failed with status', response.status);
					setLoadError('Could not load your orders. Please try again.');
					return;
				}

				const data = await response.json();
				setOrders(data);
			} catch (error) {
				console.error('Error loading orders:', error);
				setLoadError('Could not reach the server. Please try again.');
			} finally {
				setIsLoading(false);
			}
		}

		loadOrders();
	}, [props.authToken]);

	if (!props.authToken) return <p>Please log in to see your orders.</p>;
	if (isLoading) return <p>Loading your orders...</p>;
	if (loadError) return <p className="account-error">{loadError}</p>;

	if (selectedOrder) {
		return (
			<OrderInvoice
				order={selectedOrder}
				onBack={() => setSelectedOrder(null)}
			/>
		);
	}

	if (orders.length === 0) return <p>You have no orders yet.</p>;

	return (
		<div>
			{orders.map((order) => (
				<div className="account-order-row" key={order.id}>
					<span className="order-row-number">{order.order_number}</span>
					<span className={`order-status-badge ${order.status}`}>
						{order.status}
					</span>
					<button
						className="view-order-btn"
						type="button"
						onClick={() => setSelectedOrder(order)}
					>
						View Order
					</button>
				</div>
			))}
		</div>
	);
}

export default AccountOrders;
