import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { adminFetch } from './AdminApi';
import OrderInvoice from '../components/pages/OrderInvoice';
import AdminOrderEditForm from './AdminOderEditForm';

const FIELD_LABELS = {
	status: 'Status',
	fullName: 'Name',
	phone: 'Phone',
	address: 'Address',
};

function statusLabel(status) {
	const text = status.replace('_', ' ');
	return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatValue(key, value) {
	if (value === null || value === undefined || value === '') return '(empty)';
	return key === 'status' ? statusLabel(value) : value;
}

function AdminOrderDetailPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const [order, setOrder] = useState(null);
	const [nextStatuses, setNextStatuses] = useState([]);
	const [canEdit, setCanEdit] = useState(false);
	const [history, setHistory] = useState([]);
	const [reloadKey, setReloadKey] = useState(0);
	const [loadError, setLoadError] = useState('');

	const [newStatus, setNewStatus] = useState('');
	const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
	const [isSavingStatus, setIsSavingStatus] = useState(false);

	const [isEditing, setIsEditing] = useState(
		Boolean(location.state && location.state.edit),
	);
	const [editMessage, setEditMessage] = useState({ type: '', text: '' });

	useEffect(() => {
		let ignore = false;

		async function loadOrder() {
			setLoadError('');

			try {
				const result = await adminFetch(
					'/admin/orders/' + encodeURIComponent(id),
				);

				if (ignore) return;

				if (!result.ok || !result.data) {
					setLoadError(
						result.status === 404
							? 'We could not find that order.'
							: 'Could not load this order. Please try again.',
					);
					return;
				}

				setOrder(result.data.order);
				setNextStatuses(result.data.nextStatuses);
				setCanEdit(result.data.canEdit);
				setHistory(result.data.history);
			} catch (error) {
				if (ignore) return;
				console.error('Order load error:', error);
				setLoadError('Could not reach the server. Please try again.');
			}
		}

		loadOrder();

		return () => {
			ignore = true;
		};
	}, [id, reloadKey]);

	async function handleSaveStatus() {
		if (!newStatus) {
			setStatusMessage({ type: 'error', text: 'Choose the new status first.' });
			return;
		}

		setIsSavingStatus(true);
		setStatusMessage({ type: '', text: '' });

		try {
			const result = await adminFetch(
				'/admin/orders/' + encodeURIComponent(id) + '/status',
				{
					method: 'PATCH',
					body: JSON.stringify({ status: newStatus }),
				},
			);

			if (!result.ok || !result.data) {
				setStatusMessage({
					type: 'error',
					text:
						(result.data && result.data.error) ||
						'Could not update the status.',
				});
				return;
			}

			setNewStatus('');
			setStatusMessage({
				type: 'success',
				text: 'Status updated to ' + statusLabel(result.data.status) + '.',
			});
			setReloadKey((key) => key + 1);
		} catch (error) {
			console.error('Status update error:', error);
			setStatusMessage({
				type: 'error',
				text: 'Could not reach the server. Please try again.',
			});
		} finally {
			setIsSavingStatus(false);
		}
	}

	function handleEditSaved() {
		setIsEditing(false);
		setEditMessage({ type: 'success', text: 'Details updated.' });
		setReloadKey((key) => key + 1);
	}

	if (loadError) {
		return (
			<div>
				<button
					className="admin-small-btn"
					type="button"
					onClick={() => navigate('/admin')}
				>
					&larr; Back to Orders
				</button>
				<div className="auth-error" role="alert" style={{ marginTop: '1rem' }}>
					{loadError}
				</div>
			</div>
		);
	}

	if (!order) return <p className="admin-empty">Loading order...</p>;

	return (
		<div className="admin-detail-grid">
			<div>
				<OrderInvoice order={order} onBack={() => navigate('/admin')} />

				<div className="admin-side-card" style={{ marginTop: '1rem' }}>
					<h3>Change history</h3>

					{history.length === 0 ? (
						<p className="admin-side-note">No changes yet.</p>
					) : (
						history.map((event) => (
							<div className="admin-history-item" key={event.id}>
								<p className="admin-history-head">
									<strong>{event.admin_name}</strong>
									<span>{new Date(event.created_at).toLocaleString()}</span>
								</p>
								{Object.entries(event.changes || {}).map(([key, change]) => (
									<p className="admin-history-line" key={key}>
										{FIELD_LABELS[key] || key}: {formatValue(key, change.from)}{' '}
										→ {formatValue(key, change.to)}
									</p>
								))}
								{event.note && (
									<p className="admin-side-note">Reason: {event.note}</p>
								)}
							</div>
						))
					)}
				</div>
			</div>

			<div className="admin-detail-side">
				<div className="admin-side-card">
					<h3>Customer</h3>

					{isEditing && canEdit ? (
						<AdminOrderEditForm
							order={order}
							onCancel={() => setIsEditing(false)}
							onSaved={handleEditSaved}
						/>
					) : (
						<>
							<p>
								<strong>{order.full_name}</strong>
							</p>
							<p>{order.email}</p>
							<p>{order.phone}</p>
							<p className="admin-side-note">
								{order.user_id ? 'Registered customer' : 'Guest checkout'}
							</p>

							{editMessage.text && (
								<p className={'settings-message ' + editMessage.type}>
									{editMessage.text}
								</p>
							)}

							{canEdit ? (
								<button
									className="admin-small-btn"
									type="button"
									onClick={() => {
										setEditMessage({ type: '', text: '' });
										setIsEditing(true);
									}}
								>
									Edit details
								</button>
							) : (
								<p className="admin-side-note">
									Details are locked once an order is shipped, delivered,
									cancelled or refunded.
								</p>
							)}
						</>
					)}
				</div>

				<div className="admin-side-card">
					<h3>Status</h3>
					<p>
						<span className={`order-status-badge ${order.status}`}>
							{statusLabel(order.status)}
						</span>
					</p>

					{nextStatuses.length > 0 ? (
						<>
							<label htmlFor="newStatus">Move this order to</label>
							<select
								id="newStatus"
								className="admin-select"
								value={newStatus}
								onChange={(e) => setNewStatus(e.target.value)}
							>
								<option value="">Choose a status</option>
								{nextStatuses.map((option) => (
									<option key={option} value={option}>
										{statusLabel(option)}
									</option>
								))}
							</select>
							<button
								className="admin-small-btn primary"
								type="button"
								onClick={handleSaveStatus}
								disabled={isSavingStatus}
							>
								{isSavingStatus ? 'Saving...' : 'Update status'}
							</button>
						</>
					) : (
						<p className="admin-side-note">
							This order is closed, so its status can't change any more.
						</p>
					)}

					{statusMessage.text && (
						<p className={'settings-message ' + statusMessage.type}>
							{statusMessage.text}
						</p>
					)}
				</div>

				<div className="admin-side-card">
					<h3>Payment</h3>
					<p className="admin-side-note">Paystack reference</p>
					<p className="admin-mono">{order.payment_reference}</p>
				</div>
			</div>
		</div>
	);
}

export default AdminOrderDetailPage;
