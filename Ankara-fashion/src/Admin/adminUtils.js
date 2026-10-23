export function statusLabel(status) {
	const text = String(status).replace('_', ' ');
	return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatNaira(amount) {
	return '₦' + Number(amount).toLocaleString();
}

export function formatDate(value) {
	return new Date(value).toLocaleDateString(undefined, {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
}
