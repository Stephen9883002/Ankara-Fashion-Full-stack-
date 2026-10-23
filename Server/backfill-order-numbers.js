require('dotenv').config();
const pool = require('./db');
const { generateOrderNumber } = require('./orderNumber');

async function main() {
	const orders = await pool.query(
		'SELECT id, created_at FROM orders WHERE order_number IS NULL ORDER BY id',
	);

	console.log('Orders to number:', orders.rows.length);

	for (const order of orders.rows) {
		for (let attempt = 0; attempt < 5; attempt++) {
			try {
				await pool.query('UPDATE orders SET order_number = $1 WHERE id = $2', [
					generateOrderNumber(new Date(order.created_at)),
					order.id,
				]);
				break;
			} catch (error) {
				if (error.code !== '23505') throw error;
			}
		}
	}

	const left = await pool.query(
		'SELECT COUNT(*) FROM orders WHERE order_number IS NULL',
	);
	console.log('Orders still without a number:', left.rows[0].count);

	await pool.end();
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
