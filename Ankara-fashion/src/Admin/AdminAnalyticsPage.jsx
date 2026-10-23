import { useState, useEffect } from 'react';
import { adminFetch } from './AdminApi';
import { statusLabel, formatNaira } from './adminUtils';

function formatShort(amount) {
	if (amount >= 1000000) return '₦' + (amount / 1000000).toFixed(1) + 'M';
	if (amount >= 1000) return '₦' + Math.round(amount / 1000) + 'k';
	return '₦' + amount;
}

function dayLabel(day) {
	return new Date(day + 'T00:00:00').toLocaleDateString(undefined, {
		weekday: 'short',
	});
}

function plural(count, word) {
	return count + ' ' + word + (count === 1 ? '' : 's');
}

function AdminAnalyticsPage() {
	const [data, setData] = useState(null);
	const [loadError, setLoadError] = useState('');

	useEffect(() => {
		let ignore = false;

		async function loadAnalytics() {
			try {
				const result = await adminFetch('/admin/analytics');

				if (ignore) return;

				if (!result.ok || !result.data) {
					setLoadError('Could not load analytics. Please refresh the page.');
					return;
				}

				setData(result.data);
			} catch (error) {
				if (ignore) return;
				console.error('Analytics error:', error);
				setLoadError('Could not reach the server. Please try again.');
			}
		}

		loadAnalytics();

		return () => {
			ignore = true;
		};
	}, []);

	if (loadError) {
		return (
			<div className="auth-error" role="alert">
				{loadError}
			</div>
		);
	}

	if (!data) return <p className="admin-empty">Loading analytics...</p>;

	const weekRevenue = data.daily.reduce((sum, d) => sum + d.revenue, 0);
	const weekOrders = data.daily.reduce((sum, d) => sum + d.orders, 0);
	const maxRevenue = Math.max(...data.daily.map((d) => d.revenue), 1);
	const maxStatus = Math.max(...data.byStatus.map((s) => s.count), 1);

	return (
		<div>
			<h1 className="admin-page-title">Analytics</h1>
			<p className="admin-page-subtitle">
				How your store is doing. Revenue counts paid orders only.
			</p>

			<div className="admin-side-card" style={{ marginTop: '1.25rem' }}>
				<h3>Revenue, last 7 days</h3>
				<p className="admin-chart-headline">{formatNaira(weekRevenue)}</p>
				<p className="admin-side-note">
					from {plural(weekOrders, 'paid order')}
				</p>

				<div className="admin-chart">
					{data.daily.map((d) => (
						<div
							className="admin-chart-col"
							key={d.day}
							title={`${d.day}: ${formatNaira(d.revenue)} from ${plural(d.orders, 'order')}`}
						>
							<div className="admin-chart-bar-area">
								<div
									className="admin-chart-bar"
									style={{ height: (d.revenue / maxRevenue) * 100 + '%' }}
								></div>
							</div>
							<span className="admin-chart-label">{dayLabel(d.day)}</span>
							<span className="admin-chart-value">
								{formatShort(d.revenue)}
							</span>
						</div>
					))}
				</div>
			</div>

			<div className="admin-analytics-grid">
				<div className="admin-side-card">
					<h3>Orders by status</h3>

					{data.byStatus.length === 0 ? (
						<p className="admin-side-note">No orders yet.</p>
					) : (
						data.byStatus.map((s) => (
							<div className="admin-bar-row" key={s.status}>
								<span className={`order-status-badge ${s.status}`}>
									{statusLabel(s.status)}
								</span>
								<div className="admin-bar-track">
									<div
										className="admin-bar-fill"
										style={{ width: (s.count / maxStatus) * 100 + '%' }}
									></div>
								</div>
								<strong>{s.count}</strong>
							</div>
						))
					)}
				</div>

				<div className="admin-side-card">
					<h3>Best sellers</h3>

					{data.topProducts.length === 0 ? (
						<p className="admin-side-note">No sales yet.</p>
					) : (
						data.topProducts.map((p, index) => (
							<div className="admin-top-row" key={p.title}>
								<span className="admin-rank">{index + 1}</span>
								<div className="admin-top-info">
									<strong>{p.title}</strong>
									<span>{p.units} sold</span>
								</div>
								<strong>{formatNaira(p.revenue)}</strong>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}

export default AdminAnalyticsPage;
