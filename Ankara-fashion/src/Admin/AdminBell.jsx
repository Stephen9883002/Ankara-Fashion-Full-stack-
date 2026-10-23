import { useState, useEffect } from 'react';
import { adminFetch } from './AdminApi';

import { useNavigate } from 'react-router-dom';
import { statusLabel, formatNaira } from './adminUtils';

function AdminBell() {
	const navigate = useNavigate();
	const [data, setData] = useState({ count: 0, items: [] });
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		let ignore = false;

		async function laodNotifications() {
			try {
				const result = await adminFetch('/admin/notifications');

				if (!ignore && result.ok && result.data) {
					setData(result.data);
				}
			} catch (error) {
				console.error('Notifications error:', error);
			}
		}
		laodNotifications();
		const timer = setInterval(laodNotifications, 60000);

		return () => {
			ignore = true;
			clearInterval(timer);
		};
	}, [isOpen]);

	function openOrder(id) {
		setIsOpen(false);
		navigate('/admin/orders' + id);
	}

	return (
		<div className="admin-bell-wrap">
			<button
				className="admin-bell"
				type="button"
				aria-label={`Notifications, ${data.count} orders need attention`}
				aria-expanded={isOpen}
				onClick={() => setIsOpen(!isOpen)}
			>
				<i className="fas fa-bell"></i>
				{data.count > 0 && (
					<span className="admin-bell-badge">
						{data.count > 9 ? '+9' : data.count}
					</span>
				)}
			</button>

			{isOpen && (
				<>
					<div
						className="admin-bell-backdrop"
						onClick={() => setIsOpen(false)}
					></div>
					<div className="admin-bell-panel">
						<h3>Needs Your Attention</h3>

						{data.items.length === 0 ? (
							<p className="admin-side-note">You're All caught up.</p>
						) : (
							data.items.map((item) => (
								<button
									className="admin-bell-item"
									type="button"
									key={item.id}
									onClick={() => openOrder(item.id)}
								>
									<span className="admin-bell-item-main">
										<strong>{item.order_number}</strong>
										<span>
											{item.full_name} · {formatNaira(item.total)}
										</span>
									</span>
									<span className={`order-status-badge ${item.status}`}>
										{statusLabel(item.status)}
									</span>
								</button>
							))
						)}

						{data.count > data.items.length && (
							<p className="admin-side-note">
								And {data.count - data.items.length} more. Filter the Orders
								page by paid orders to see them all.
							</p>
						)}
					</div>
				</>
			)}
		</div>
	);
}
export default AdminBell;
