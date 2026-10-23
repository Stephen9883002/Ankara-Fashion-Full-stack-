import { useState, useEffect } from 'react';
import { adminFetch } from './AdminApi';
import { formatDate } from './adminUtils';
import AdminAddAdminForm from './AdminAddAdminForm';

function AdminUsersPage() {
	const [users, setUsers] = useState([]);
	const [total, setTotal] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [page, setPage] = useState(1);
	const [role, setRole] = useState('');
	const [search, setSearch] = useState('');
	const [searchInput, setSearchInput] = useState('');
	const [reloadKey, setReloadKey] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState('');
	const [showAddForm, setShowAddForm] = useState(false);
	const [notice, setNotice] = useState('');

	useEffect(() => {
		let ignore = false;

		async function loadUsers() {
			setIsLoading(true);
			setLoadError('');

			try {
				const params = new URLSearchParams({ page: String(page) });
				if (role) params.set('role', role);
				if (search) params.set('search', search);

				const result = await adminFetch('/admin/users?' + params.toString());

				if (ignore) return;

				if (!result.ok || !result.data) {
					setLoadError('Could not load users. Please try again.');
					return;
				}

				setUsers(result.data.users);
				setTotal(result.data.total);
				setTotalPages(result.data.totalPages);
				setPageSize(result.data.pageSize);
			} catch (error) {
				if (ignore) return;
				console.error('Users error:', error);
				setLoadError('Could not reach the server. Please try again.');
			} finally {
				if (!ignore) setIsLoading(false);
			}
		}

		loadUsers();

		return () => {
			ignore = true;
		};
	}, [page, role, search, reloadKey]);

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

	function handleRoleChange(e) {
		setRole(e.target.value);
		setPage(1);
	}

	function handleAdminCreated(user) {
		setShowAddForm(false);
		setNotice(
			'Admin account created for ' +
				user.full_name +
				'. Share the password with them privately.',
		);
		setReloadKey(reloadKey + 1);
	}

	const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const to = Math.min(page * pageSize, total);

	return (
		<div>
			<div className="admin-page-head">
				<div>
					<h1 className="admin-page-title">User Management</h1>
					<p className="admin-page-subtitle">
						See your customers and manage who has admin access.
					</p>
				</div>
				<button
					className="admin-primary-btn"
					type="button"
					onClick={() => {
						setNotice('');
						setShowAddForm(true);
					}}
				>
					<i className="fas fa-user-plus"></i> Add New Admin
				</button>
			</div>

			{notice && <div className="auth-notice">{notice}</div>}

			<div className="admin-toolbar">
				<form className="admin-search" onSubmit={handleSearchSubmit}>
					<input
						type="text"
						placeholder="Search by name or email"
						aria-label="Search users"
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
					aria-label="Filter by role"
					value={role}
					onChange={handleRoleChange}
				>
					<option value="">All users</option>
					<option value="admin">Admins</option>
					<option value="customer">Customers</option>
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

			{isLoading && users.length === 0 && !loadError && (
				<p className="admin-empty">Loading users...</p>
			)}

			{!isLoading && !loadError && users.length === 0 && (
				<p className="admin-empty">No users match your search or filter.</p>
			)}

			{users.length > 0 && (
				<div className={'admin-table-wrap' + (isLoading ? ' is-loading' : '')}>
					<table className="admin-table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Role</th>
								<th>Orders</th>
								<th>Joined</th>
							</tr>
						</thead>
						<tbody>
							{users.map((user) => (
								<tr key={user.id}>
									<td data-label="Name">
										<div>
											{user.full_name}
											<small className="admin-cell-note">{user.email}</small>
										</div>
									</td>
									<td data-label="Role">
										<span className={`role-badge ${user.role}`}>
											{user.role === 'admin' ? 'Admin' : 'Customer'}
										</span>
									</td>
									<td data-label="Orders">{user.order_count}</td>
									<td data-label="Joined">{formatDate(user.created_at)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{total > 0 && (
				<div className="admin-pager">
					<span>
						Showing {from}-{to} of {total} users
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

			{showAddForm && (
				<AdminAddAdminForm
					onClose={() => setShowAddForm(false)}
					onCreated={handleAdminCreated}
				/>
			)}
		</div>
	);
}

export default AdminUsersPage;
