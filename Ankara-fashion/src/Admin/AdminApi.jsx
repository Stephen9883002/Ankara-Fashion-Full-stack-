import { API_URL } from '../config';
import { getAdminToken, clearAdminSession } from './adminSession';

export async function adminFetch(path, options = {}) {
	const response = await fetch(`${API_URL}${path}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${getAdminToken()}`,
			...(options.headers || {}),
		},
	});

	if (response.status === 401 || response.status === 403) {
		clearAdminSession();
		window.location.assign('/admin/login');
	}

	const data = await response.json().catch(() => null);

	return { ok: response.ok, status: response.status, data };
}
