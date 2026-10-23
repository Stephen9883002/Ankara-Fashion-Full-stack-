import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { API_URL } from '../config';
import { getAdminToken, clearAdminSession } from './adminSession';

function AdminRoute(props) {
	const token = getAdminToken();
	const [status, setStatus] = useState(token ? 'checking' : 'denied');

	useEffect(() => {
		if (!token) return;

		async function checkAccess() {
			try {
				const response = await fetch(`${API_URL}/admin/me`, {
					headers: { Authorization: `Bearer ${token}` },
				});

				if (response.ok) {
					setStatus('allowed');
				} else {
					clearAdminSession();
					setStatus('denied');
				}
			} catch (error) {
				console.error('Admin check failed:', error);
				setStatus('error');
			}
		}

		checkAccess();
	}, [token]);

	if (status === 'denied') return <Navigate to="/admin/login" replace />;
	if (status === 'checking')
		return <p className="admin-status-message">Checking access...</p>;
	if (status === 'error') {
		return (
			<p className="admin-status-message">
				Could not reach the server. Please try again.
			</p>
		);
	}

	return props.children;
}

export default AdminRoute;
