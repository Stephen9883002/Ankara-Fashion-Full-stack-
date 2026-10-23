require('dotenv').config();
const crypto = require('crypto');
const pool = require('./db');

async function main() {
	let reference = process.argv[2];

	if (!reference) {
		const result = await pool.query(
			"SELECT payment_reference FROM orders WHERE status = 'pending' ORDER BY id DESC LIMIT 1",
		);

		if (result.rows.length === 0) {
			console.log('No pending order found. Make a test payment first.');
			await pool.end();
			return;
		}

		reference = result.rows[0].payment_reference;
	}

	console.log('Sending a signed webhook for reference:', reference);

	const body = JSON.stringify({ event: 'charge.success', data: { reference } });

	const signature = crypto
		.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
		.update(body)
		.digest('hex');

	const response = await fetch('http://localhost:3000/paystack-webhook', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-paystack-signature': signature,
		},
		body: body,
	});

	console.log('Server answered with status:', response.status);
	await pool.end();
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
