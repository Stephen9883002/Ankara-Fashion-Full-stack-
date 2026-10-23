const TOKEN_KEY = 'ankaraAdminToken';
const USER_KEY = 'ankaraAdminUser';

export function saveAdminSession(user, token) {
	sessionStorage.setItem(USER_KEY, JSON.stringify(user));
	sessionStorage.setItem(TOKEN_KEY, token);
}

export function getAdminToken() {
	return sessionStorage.getItem(TOKEN_KEY);
}

export function getAdminUser() {
	try {
		const saved = sessionStorage.getItem(USER_KEY);
		return saved ? JSON.parse(saved) : null;
	} catch {
		return null;
	}
}

export function clearAdminSession() {
	sessionStorage.removeItem(USER_KEY);
	sessionStorage.removeItem(TOKEN_KEY);
}
