import AdminOrdersTable from './AdminOrdersTable';
import { useState, useEffect } from 'react';
import { adminFetch } from './adminApi';

function formatNaira(amount) {
	return '₦' + amount.toLocaleString();
}

function plural(count, word) {
	return count + ' ' + word + (count === 1 ? '' : 's');
}

function AdminOrdersPage() {
	const [stats, setStats] = useState(null);
	const [statsError, setStatsError] = useState('');

	useEffect(() => {
		async function loadStats() {
			try {
				const result = await adminFetch('/admin/stats');

				if (!result.ok) {
					setStatsError(
						'Could not load your numbers. Please refresh the page.',
					);
					return;
				}

				setStats(result.data);
			} catch (error) {
				console.error('Stats error:', error);
				setStatsError('Could not reach the server. Please try again.');
			}
		}

		loadStats();
	}, []);

	return (
		<div>
			<h1 className="admin-page-title">Orders</h1>
			<p className="admin-page-subtitle">
				Track sales and manage customer orders.
			</p>

			{statsError && (
				<div className="auth-error" role="alert">
					{statsError}
				</div>
			)}

			<div className="admin-stat-grid">
				<div className="admin-stat-card">
					<span className="admin-stat-icon">
						<i className="fas fa-coins"></i>
					</span>
					<span className="admin-stat-label">Total Revenue</span>
					<strong className="admin-stat-value">
						{stats ? formatNaira(stats.revenue) : '...'}
					</strong>
					<span className="admin-stat-note">
						{stats
							? 'from ' + plural(stats.paidOrders, 'paid order')
							: 'Loading...'}
					</span>
				</div>

				<div className="admin-stat-card">
					<span className="admin-stat-icon">
						<i className="fas fa-bag-shopping"></i>
					</span>
					<span className="admin-stat-label">Today</span>
					<strong className="admin-stat-value">
						{stats ? plural(stats.todayOrders, 'order') : '...'}
					</strong>
					<span className="admin-stat-note">
						{stats
							? formatNaira(stats.todayRevenue) + ' revenue today'
							: 'Loading...'}
					</span>
				</div>
			</div>

			<AdminOrdersTable />
		</div>
	);
}

export default AdminOrdersPage;
