import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
	getAdminUser,
	clearAdminSession,
	getAdminToken,
	saveAdminSession,
} from './adminSession';
import AdminBell from './AdminBell';

function AdminLayout() {
	const navigate = useNavigate();
	const [admin, setAdmin] = useState(() => getAdminUser());
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const location = useLocation();
	const ordersActive =
		location.pathname === '/admin' ||
		location.pathname.startsWith('/admin/orders');

	function closeMenu() {
		setIsMenuOpen(false);
	}

	function handleLogout() {
		clearAdminSession();
		navigate('/admin/login', { replace: true });
	}

	function handleAdminUpdated(user) {
		saveAdminSession(user, getAdminToken());
		setAdmin(user);
	}

	return (
		<div className="admin-shell">
			<aside className={`admin-sidebar ${isMenuOpen ? 'open' : ''}`}>
				<div className="admin-brand">
					<div className="ankara-logo-frame">
						<a href="#hero">
							<img src="/img/ANK-LOGO.PNG" alt="Ankara Fashion Logo" />
						</a>
					</div>
					<span>Admin Panel</span>
				</div>

				<NavLink
					to="/admin"
					end
					className={`admin-nav-item ${ordersActive ? 'active' : ''}`}
					onClick={closeMenu}
				>
					<i className="fas fa-bag-shopping"></i> Orders
				</NavLink>
				<NavLink
					to="/admin/users"
					className="admin-nav-item"
					onClick={closeMenu}
				>
					<i className="fas fa-users"></i> User Management
				</NavLink>
				<NavLink
					to="/admin/analytics"
					className="admin-nav-item"
					onClick={closeMenu}
				>
					<i className="fas fa-chart-line"></i> Analytics
				</NavLink>
				<NavLink
					to="/admin/settings"
					className="admin-nav-item"
					onClick={closeMenu}
				>
					<i className="fas fa-gear"></i> Settings
				</NavLink>

				<button
					className="admin-nav-item admin-logout"
					type="button"
					onClick={handleLogout}
				>
					<i className="fas fa-right-from-bracket"></i> Log Out
				</button>
			</aside>

			{isMenuOpen && <div className="admin-overlay" onClick={closeMenu}></div>}

			<div className="admin-main">
				<header className="admin-header">
					<button
						className="admin-menu-btn"
						type="button"
						aria-label="Open menu"
						aria-expanded={isMenuOpen}
						onClick={() => setIsMenuOpen(true)}
					>
						<i className="fas fa-bars"></i>
					</button>

					<div className="admin-header-right">
						<AdminBell />
						<div className="admin-user">
							<strong>{admin ? admin.fullName : 'Admin'}</strong>
							<span>Administrator</span>
						</div>
					</div>
				</header>

				<main className="admin-content">
					<Outlet
						context={{ admin: admin, onAdminUpdated: handleAdminUpdated }}
					/>
				</main>
			</div>
		</div>
	);
}

export default AdminLayout;
