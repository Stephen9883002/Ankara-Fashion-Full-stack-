import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { adminFetch } from './adminApi';

const STATUS_OPTIONS = [
	'pending',
	'paid',
	'processing',
	'shipped',
	'delivered',
	'needs_attention',
	'cancelled',
	'refunded',
];

function statusLabel(status) {
	const text = status.replace('_', ' ');
	return text.charAt(0).toUpperCase() + text.slice(1);
}

function AdminOrdersTable() {
	const [orders, setOrders] = useState([]);
	const [total, setTotal] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState('');
	const [search, setSearch] = useState('');
	const [searchInput, setSearchInput] = useState('');
	const [reloadKey, setReloadKey] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState('');
	const navigate = useNavigate();

	useEffect(() => {
		let ignore = false;

		async function loadOrders() {
			setIsLoading(true);
			setLoadError('');

			try {
				const params = new URLSearchParams({ page: String(page) });
				if (status) params.set('status', status);
				if (search) params.set('search', search);

				const result = await adminFetch('/admin/orders?' + params.toString());

				if (ignore) return;

				if (!result.ok || !result.data) {
					setLoadError('Could not load orders. Please try again.');
					return;
				}

				setOrders(result.data.orders);
				setTotal(result.data.total);
				setTotalPages(result.data.totalPages);
				setPageSize(result.data.pageSize);
			} catch (error) {
				if (ignore) return;
				console.error('Orders error:', error);
				setLoadError('Could not reach the server. Please try again.');
			} finally {
				if (!ignore) setIsLoading(false);
			}
		}

		loadOrders();

		return () => {
			ignore = true;
		};
	}, [page, status, search, reloadKey]);

	function handleSearchSubmit(e) {
		e.preventDefault();
		setPage(1);
		setSearch(searchInput.trim());
	}

	function handleClearSearch() {
		setSearchInput('');
		setSearch('');
		setPage(1);
	}

	function handleStatusChange(e) {
		setStatus(e.target.value);
		setPage(1);
	}

	const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const to = Math.min(page * pageSize, total);

	return (
		<div>
			<div className="admin-toolbar">
				<form className="admin-search" onSubmit={handleSearchSubmit}>
					<input
						type="text"
						placeholder="Search by order number, name, email or phone"
						aria-label="Search orders"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
					/>
					<button className="admin-small-btn primary" type="submit">
						Search
					</button>
					{search && (
						<button
							className="admin-small-btn"
							type="button"
							onClick={handleClearSearch}
						>
							Clear
						</button>
					)}
				</form>

				<select
					className="admin-select"
					aria-label="Filter by status"
					value={status}
					onChange={handleStatusChange}
				>
					<option value="">All statuses</option>
					{STATUS_OPTIONS.map((option) => (
						<option key={option} value={option}>
							{statusLabel(option)}
						</option>
					))}
				</select>

				<button
					className="admin-small-btn"
					type="button"
					onClick={() => setReloadKey(reloadKey + 1)}
				>
					Refresh
				</button>
			</div>

			{loadError && (
				<div className="auth-error" role="alert">
					{loadError}
				</div>
			)}

			{isLoading && orders.length === 0 && !loadError && (
				<p className="admin-empty">Loading orders...</p>
			)}

			{!isLoading && !loadError && orders.length === 0 && (
				<p className="admin-empty">No orders match your search or filter.</p>
			)}

			{orders.length > 0 && (
				<div className={'admin-table-wrap' + (isLoading ? ' is-loading' : '')}>
					<table className="admin-table">
						<thead>
							<tr>
								<th>Order</th>
								<th>Customer</th>
								<th>Total</th>
								<th>Status</th>
								<th>Date</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{orders.map((order) => (
								<tr key={order.id}>
									<td data-label="Order">
										<strong>{order.order_number}</strong>
									</td>
									<td data-label="Customer">
										<div>
											{order.full_name}
											<small className="admin-cell-note">{order.email}</small>
										</div>
									</td>
									<td data-label="Total">₦{order.total.toLocaleString()}</td>
									<td data-label="Status">
										<span className={`order-status-badge ${order.status}`}>
											{statusLabel(order.status)}
										</span>
									</td>
									<td data-label="Date">
										{new Date(order.created_at).toLocaleDateString(undefined, {
											day: 'numeric',
											month: 'short',
											year: 'numeric',
										})}
									</td>
									<td data-label="Actions">
										<div className="admin-actions">
											<button
												className="admin-small-btn"
												type="button"
												onClick={() => navigate('/admin/orders/' + order.id)}
											>
												View
											</button>
											<button
												className="admin-small-btn"
												type="button"
												onClick={() =>
													navigate('/admin/orders/' + order.id, {
														state: { edit: true },
													})
												}
											>
												Edit
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{total > 0 && (
				<div className="admin-pager">
					<span>
						Showing {from}-{to} of {total} orders
					</span>
					<div className="admin-pager-buttons">
						<button
							className="admin-small-btn"
							type="button"
							disabled={page <= 1}
							onClick={() => setPage(page - 1)}
						>
							Previous
						</button>
						<span>
							Page {page} of {totalPages}
						</span>
						<button
							className="admin-small-btn"
							type="button"
							disabled={page >= totalPages}
							onClick={() => setPage(page + 1)}
						>
							Next
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

export default AdminOrdersTable;
