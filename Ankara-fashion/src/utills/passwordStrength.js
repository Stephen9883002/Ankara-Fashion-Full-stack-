export const MIN_PASSWORD_LENGTH = 6;

export function getPasswordStrength(password) {
	if (!password) return { level: 0, label: '' };
	if (password.length < MIN_PASSWORD_LENGTH)
		return { level: 1, label: 'Too short' };

	let points = 0;
	if (password.length >= 10) points += 1;
	if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points += 1;
	if (/\d/.test(password)) points += 1;
	if (/[^A-Za-z0-9]/.test(password)) points += 1;

	if (points <= 1) return { level: 2, label: 'Weak' };
	if (points === 2) return { level: 3, label: 'Medium' };
	return { level: 4, label: 'Strong' };
}
