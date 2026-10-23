const crypto = require('crypto');

function luhnCheckDigit(payload) {
	let sum = 0;
	let shouldDouble = true;

	for (let i = payload.length - 1; i >= 0; i--) {
		let digit = Number(payload[i]);

		if (shouldDouble) {
			digit *= 2;
			if (digit > 9) digit -= 9;
		}

		sum += digit;
		shouldDouble = !shouldDouble;
	}

	return (10 - (sum % 10)) % 10;
}

function generateOrderNumber(date = new Date()) {
	const year = String(date.getFullYear()).slice(-2);
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const datePart = year + month + day;

	const randomPart = String(crypto.randomInt(0, 1000000000)).padStart(9, '0');
	const checkDigit = luhnCheckDigit(datePart + randomPart);

	return 'ANK-ORDER-' + datePart + '-' + randomPart + checkDigit;
}

function normalizeOrderNumber(input) {
	const digits = String(input || '').replace(/\D/g, '');

	if (digits.length !== 16) return null;

	const expectedCheck = luhnCheckDigit(digits.slice(0, 15));

	if (Number(digits[15]) !== expectedCheck) return null;

	return 'ANK-ORDER-' + digits.slice(0, 6) + '-' + digits.slice(6);
}

module.exports = { generateOrderNumber, normalizeOrderNumber };
