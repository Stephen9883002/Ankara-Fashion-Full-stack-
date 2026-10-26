const express = require('express');
const app = express();

// Now app is initialized first, so this line will run smoothly!
app.set('trust proxy', 1);

const pool = require('./db'); // 👈 Your pool import is safely right here!
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const {
	trackLimiter,
	loginLimiter,
	registerLimiter,
	checkoutLimiter,
	passwordLimiter,
} = require('./rateLimiters');

const REVENUE_STATUSES = ['paid', 'processing', 'shipped', 'delivered'];
const EDITABLE_STATUSES = ['pending', 'paid', 'needs_attention', 'processing'];

const { generateOrderNumber, normalizeOrderNumber } = require('./orderNumber');

app.use(cors());

app.use(
	express.json({
		verify: (req, res, buf) => {
			req.rawBody = buf;
		},
	}),
);

app.get('/', (req, res) => {
	res.send('Server is alive!');
});

const MIN_PASSWORD_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COMMON_PASSWORDS = [
	'password',
	'password1',
	'password123',
	'123456',
	'1234567',
	'12345678',
	'qwerty',
	'qwerty123',
	'abc123',
	'iloveyou',
	'admin123',
	'letmein',
];

function getPasswordPoints(password) {
	let points = 0;
	if (password.length >= 10) points += 1;
	if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points += 1;
	if (/\d/.test(password)) points += 1;
	if (/[^A-Za-z0-9]/.test(password)) points += 1;
	return points;
}

function requireAuth(req, res, next) {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'No token provided' });
	}

	const token = authHeader.split(' ')[1];

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (error) {
		return res.status(401).json({ error: 'Invalid or expired token' });
	}
}

function optionalAuth(req, res, next) {
	const authHeader = req.headers.authorization;

	if (authHeader && authHeader.startsWith('Bearer ')) {
		try {
			req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
		} catch {
			// bad or expired token: carry on as a guest
		}
	}

	next();
}
app.post('/admin/login', loginLimiter, async (req, res) => {
	try {
		const { password } = req.body;
		const email = String(req.body.email || '')
			.trim()
			.toLowerCase();

		if (!email || typeof password !== 'string' || !password) {
			return res.status(400).json({ error: 'Email and password are required' });
		}

		const result = await pool.query('SELECT * FROM users WHERE email = $1', [
			email,
		]);
		const user = result.rows[0];

		// Always run one bcrypt check, so an unknown email takes as long as a wrong password
		const passwordMatches = await bcrypt.compare(
			password,
			user ? user.password_hash : DUMMY_HASH,
		);

		if (!user || !passwordMatches || user.role !== 'admin') {
			return res.status(401).json({ error: 'Invalid email or password' });
		}

		const token = jwt.sign(
			{ id: user.id, email: user.email, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: '8h' },
		);

		res.json({
			token: token,
			user: {
				id: user.id,
				fullName: user.full_name,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			error: 'Something went wrong in the server, refresh the page and retry',
		});
	}
});

app.get('/admin/stats', requireAuth, requireAdmin, async (req, res) => {
	try {
		const result = await pool.query(
			`SELECT
				COALESCE(SUM(total) FILTER (WHERE status = ANY($1::text[])), 0) AS revenue,
				COUNT(*) FILTER (WHERE status = ANY($1::text[])) AS paid_orders,
				COALESCE(SUM(total) FILTER (WHERE status = ANY($1::text[]) AND created_at >= CURRENT_DATE), 0) AS today_revenue,
				COUNT(*) FILTER (WHERE status = ANY($1::text[]) AND created_at >= CURRENT_DATE) AS today_orders
			FROM orders`,
			[REVENUE_STATUSES],
		);

		const row = result.rows[0];

		res.json({
			revenue: Number(row.revenue),
			paidOrders: Number(row.paid_orders),
			todayRevenue: Number(row.today_revenue),
			todayOrders: Number(row.today_orders),
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			error: 'Something went wrong in the server, refresh the page and retry',
		});
	}
});

app.get('/admin/me', requireAuth, requireAdmin, async (req, res) => {
	try {
		const result = await pool.query(
			'SELECT id, full_name, email, role FROM users WHERE id = $1',
			[req.user.id],
		);
		const user = result.rows[0];

		res.json({
			id: user.id,
			fullName: user.full_name,
			email: user.email,
			role: user.role,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			error: 'Server Error please refresh the page and retry',
		});
	}
});

async function requireAdmin(req, res, next) {
	try {
		const result = await pool.query(
			'SELECT role, full_name FROM users WHERE id = $1',
			[req.user.id],
		);

		if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
			return res.status(403).json({ error: 'Admin access required' });
		}

		req.adminName = result.rows[0].full_name;
		next();
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ error: 'Server Error please refresh the page and retry' });
	}
}

async function markOrderPaid(orderId) {
	const client = await pool.connect();

	try {
		await client.query('BEGIN');

		const locked = await client.query(
			'SELECT * FROM orders WHERE id = $1 FOR UPDATE',
			[orderId],
		);
		const order = locked.rows[0];

		if (order.status !== 'pending') {
			await client.query('COMMIT');
			return { order, needsAttention: order.status === 'needs_attention' };
		}

		// Same order every time, so two transactions can never lock each other in a circle
		const items = [...order.items].sort((a, b) => a.id - b.id);

		for (const item of items) {
			const reserved = await client.query(
				'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING id',
				[item.qty, item.id],
			);

			if (reserved.rows.length === 0) {
				await client.query('ROLLBACK');

				const flagged = await pool.query(
					"UPDATE orders SET status = 'needs_attention' WHERE id = $1 AND status = 'pending' RETURNING *",
					[orderId],
				);

				return { order: flagged.rows[0] || order, needsAttention: true };
			}
		}

		const paid = await client.query(
			"UPDATE orders SET status = 'paid' WHERE id = $1 RETURNING *",
			[orderId],
		);
		await client.query('COMMIT');

		return { order: paid.rows[0], needsAttention: false };
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
}

async function confirmPayment(reference) {
	const orderResult = await pool.query(
		'SELECT * FROM orders WHERE payment_reference = $1',
		[reference],
	);

	if (orderResult.rows.length === 0) {
		return { ok: false, reason: 'Order not found' };
	}

	const order = orderResult.rows[0];

	if (order.status !== 'pending') {
		if (order.status === 'needs_attention')
			return { ok: true, order, needsAttention: true };
		if (order.status === 'cancelled' || order.status === 'refunded') {
			return { ok: false, reason: 'Order is no longer active' };
		}
		return { ok: true, order, needsAttention: false };
	}

	let payment;

	try {
		const response = await axios.get(
			`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
			{
				headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
			},
		);
		payment = response.data.data;
	} catch (error) {
		if (error.response) {
			return { ok: false, reason: 'Payment not confirmed' };
		}
		throw error;
	}

	const amountMatches = payment.amount === order.total * 100;
	const currencyMatches = payment.currency === 'NGN';

	if (payment.status !== 'success' || !amountMatches || !currencyMatches) {
		return { ok: false, reason: 'Payment not confirmed' };
	}

	const result = await markOrderPaid(order.id);
	return {
		ok: true,
		order: result.order,
		needsAttention: result.needsAttention,
	};
}
function validatePasswordRules(password) {
	if (typeof password !== 'string' || !password) return 'Password is required';
	if (password.length < MIN_PASSWORD_LENGTH)
		return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
	if (getPasswordPoints(password) < 2)
		return 'Please choose a stronger password. Mix upper and lower case letters, numbers or symbols.';
	if (COMMON_PASSWORDS.includes(password.toLowerCase()))
		return 'That password is too common. Please choose another.';
	if (Buffer.byteLength(password, 'utf8') > 72)
		return 'Password is too long (72 bytes maximum)';
	return null;
}
app.post('/register', registerLimiter, async (req, res) => {
	try {
		const { fullName, password } = req.body;
		const email = String(req.body.email || '')
			.trim()
			.toLowerCase();

		if (
			typeof fullName !== 'string' ||
			typeof password !== 'string' ||
			!fullName.trim() ||
			!email ||
			!password
		) {
			return res.status(400).json({ error: 'All fields are required' });
		}

		if (!EMAIL_PATTERN.test(email)) {
			return res.status(400).json({ error: 'Please enter a valid email addy' });
		}

		const passwordError = validatePasswordRules(password);
		if (passwordError) {
			return res.status(400).json({ error: passwordError });
		}

		const existing = await pool.query('SELECT id FROM users WHERE email = $1', [
			email,
		]);

		if (existing.rows.length > 0) {
			return res
				.status(409)
				.json({ error: 'An account with this email already exists' });
		}

		const passwordHash = await bcrypt.hash(password, 10);

		const result = await pool.query(
			'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, full_name, email, role',
			[fullName.trim(), email, passwordHash],
		);

		res.status(201).json(result.rows[0]);
	} catch (error) {
		if (error.code === '23505') {
			return res
				.status(409)
				.json({ error: 'An account with this email already exists' });
		}
		console.error(error);
		res.status(500).json({ error: 'Something went wrong' });
	}
});
app.patch('/me', requireAuth, async (req, res) => {
	try {
		const { fullName, currentPassword } = req.body;
		const email = String(req.body.email || '')
			.trim()
			.toLowerCase();

		if (typeof fullName !== 'string' || !fullName.trim() || !email) {
			return res.status(400).json({ error: 'Name and email are required' });
		}

		if (!EMAIL_PATTERN.test(email)) {
			return res
				.status(400)
				.json({ error: 'Please enter a valid email address' });
		}

		const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [
			req.user.id,
		]);

		if (userResult.rows.length === 0) {
			return res.status(404).json({ error: 'User not found' });
		}

		const user = userResult.rows[0];

		if (email !== user.email) {
			if (typeof currentPassword !== 'string' || !currentPassword) {
				return res
					.status(400)
					.json({ error: 'Enter your current password to change your email' });
			}

			const matches = await bcrypt.compare(currentPassword, user.password_hash);

			if (!matches) {
				return res.status(400).json({ error: 'Current password is incorrect' });
			}

			const taken = await pool.query(
				'SELECT id FROM users WHERE email = $1 AND id <> $2',
				[email, user.id],
			);

			if (taken.rows.length > 0) {
				return res.status(409).json({ error: 'That email is already in use' });
			}
		}

		const updated = await pool.query(
			'UPDATE users SET full_name = $1, email = $2 WHERE id = $3 RETURNING id, full_name, email, role',
			[fullName.trim(), email, user.id],
		);

		const row = updated.rows[0];
		res.json({
			id: row.id,
			fullName: row.full_name,
			email: row.email,
			role: row.role,
		});
	} catch (error) {
		if (error.code === '23505') {
			return res.status(409).json({ error: 'That email is already in use' });
		}
		console.error(error);
		res.status(500).json({ error: 'Something went wrong' });
	}
});

app.patch('/me/password', passwordLimiter, requireAuth, async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;

		if (typeof currentPassword !== 'string' || !currentPassword) {
			return res.status(400).json({ error: 'Enter your current password' });
		}

		const passwordError = validatePasswordRules(newPassword);

		if (passwordError) {
			return res.status(400).json({ error: passwordError });
		}

		const userResult = await pool.query(
			'SELECT password_hash FROM users WHERE id = $1',
			[req.user.id],
		);

		if (userResult.rows.length === 0) {
			return res.status(404).json({ error: 'User not found' });
		}

		const matches = await bcrypt.compare(
			currentPassword,
			userResult.rows[0].password_hash,
		);

		if (!matches) {
			return res.status(400).json({ error: 'Current password is incorrect' });
		}

		if (currentPassword === newPassword) {
			return res
				.status(400)
				.json({ error: 'New password must be different from the current one' });
		}

		const newHash = await bcrypt.hash(newPassword, 10);
		await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
			newHash,
			req.user.id,
		]);

		res.json({ message: 'Password updated' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Something went wrong' });
	}
});

app.post('/login', loginLimiter, async (req, res) => {
	try {
		const { password, rememberMe } = req.body;
		const email = String(req.body.email || '')
			.trim()
			.toLowerCase();

		if (!email || typeof password !== 'string' || !password) {
			return res.status(400).json({ error: 'Email and password are required' });
		}

		const result = await pool.query('SELECT * FROM users WHERE email = $1', [
			email,
		]);

		if (result.rows.length === 0) {
			return res.status(401).json({ error: 'Invalid email or password' });
		}

		const user = result.rows[0];

		const passwordMatches = await bcrypt.compare(password, user.password_hash);

		if (!passwordMatches) {
			return res.status(401).json({ error: 'Invalid email or password' });
		}

		const token = jwt.sign(
			{ id: user.id, email: user.email, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: rememberMe === true ? '30d' : '1d' },
		);

		res.json({
			token: token,
			user: {
				id: user.id,
				fullName: user.full_name,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Something went wrong' });
	}
});

app.get('/products', async (req, res) => {
	try {
		const result = await pool.query('SELECT * FROM products');

		const products = result.rows.map((row) => {
			const soldOut = row.stock <= 0;

			return {
				id: row.id,
				title: row.title,
				price: row.price,
				image: row.image,
				statusText: soldOut ? 'Out Of Stock' : row.status_text,
				statusClass: soldOut ? 'sold-out' : row.status_class,
				section: row.section,
				category: row.category,
			};
		});

		app.get('/my-orders', requireAuth, async (req, res) => {
			try {
				const result = await pool.query(
					'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
					[req.user.id],
				);
				res.json(result.rows);
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Something went wrong' });
			}
		});

		// app.patch(
		// 	'/orders/:id/status',
		// 	requireAuth,
		// 	requireAdmin,
		// 	async (req, res) => {
		// 		try {
		// 			const { id } = req.params;
		// 			const { status } = req.body;

		// 			const validStatuses = [
		// 				'pending',
		// 				'paid',
		// 				'processing',
		// 				'shipped',
		// 				'delivered',
		// 			];

		// 			if (!validStatuses.includes(status)) {
		// 				return res.status(400).json({ error: 'Invalid status value' });
		// 			}
		// 			const result = await pool.query(
		// 				'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
		// 				[status, id],
		// 			);
		// 			if (result.rows.length === 0) {
		// 				return res.status(404).json({ error: 'Order not found' });
		// 			}
		// 			res.json(result.rows[0]);
		// 		} catch (error) {
		// 			console.error(error);
		// 			res.status(500).json({ error: 'Something went wrong' });
		// 		}
		// 	},
		// );
		const STATUS_FLOW = {
			pending: ['processing', 'cancelled'],
			paid: ['processing', 'refunded'],
			needs_attention: ['processing', 'refunded'],
			processing: ['shipped', 'refunded'],
			shipped: ['delivered'],
			delivered: ['refunded'],
			cancelled: [],
			refunded: ['processing'],
		};
		app.get(
			'/admin/orders/:id',
			requireAuth,
			requireAdmin,
			async (req, res) => {
				try {
					const id = Number(req.params.id);

					if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
						return res.status(404).json({ error: 'Order not found' });
					}

					const result = await pool.query(
						'SELECT id, order_number, full_name, email, phone, address, items, total, status, created_at, payment_reference, user_id FROM orders WHERE id = $1',
						[id],
					);

					if (result.rows.length === 0) {
						return res.status(404).json({ error: 'Order not found' });
					}
					const order = result.rows[0];

					const events = await pool.query(
						'SELECT id, admin_name, action, changes, note, created_at FROM order_events WHERE order_id = $1 ORDER BY created_at DESC, id DESC',
						[id],
					);

					res.json({
						order: order,
						nextStatuses: STATUS_FLOW[order.status] || [],
						canEdit: EDITABLE_STATUSES.includes(order.status),
						history: events.rows,
					});
				} catch (error) {
					console.error(error);
					res.status(500).json({ error: 'Something went wrong' });
				}
			},
		);

		app.patch(
			'/admin/orders/:id/status',
			requireAuth,
			requireAdmin,
			async (req, res) => {
				const id = Number(req.params.id);
				const newStatus = String(req.body.status || '');

				if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
					return res.status(404).json({ error: 'Order not found' });
				}

				const client = await pool.connect();

				try {
					await client.query('BEGIN');

					const current = await client.query(
						'SELECT status FROM orders WHERE id = $1 FOR UPDATE',
						[id],
					);

					if (current.rows.length === 0) {
						await client.query('ROLLBACK');
						return res.status(404).json({ error: 'Order not found' });
					}

					const currentStatus = current.rows[0].status;
					const allowed = STATUS_FLOW[currentStatus] || [];

					if (!allowed.includes(newStatus)) {
						await client.query('ROLLBACK');
						return res.status(400).json({
							error: `An order that is ${currentStatus.replace('_', ' ')} can't be moved to ${newStatus.replace('_', ' ')}`,
						});
					}

					await client.query('UPDATE orders SET status = $1 WHERE id = $2', [
						newStatus,
						id,
					]);

					await client.query(
						'INSERT INTO order_events (order_id, admin_id, admin_name, action, changes) VALUES ($1, $2, $3, $4, $5)',
						[
							id,
							req.user.id,
							req.adminName,
							'status_changed',
							JSON.stringify({
								status: { from: currentStatus, to: newStatus },
							}),
						],
					);

					await client.query('COMMIT');

					res.json({
						status: newStatus,
						nextStatuses: STATUS_FLOW[newStatus] || [],
					});
				} catch (error) {
					await client.query('ROLLBACK').catch(() => {});
					console.error(error);
					res.status(500).json({ error: 'Something went wrong' });
				} finally {
					client.release();
				}
			},
		);

		app.patch(
			'/admin/orders/:id',
			requireAuth,
			requireAdmin,
			async (req, res) => {
				const id = Number(req.params.id);

				if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
					return res.status(404).json({ error: 'Order not found' });
				}

				const fullName = String(req.body.fullName || '').trim();
				const phone = String(req.body.phone || '').trim();
				const address = String(req.body.address || '').trim();
				const note = String(req.body.note || '').trim();

				if (fullName.length < 2 || fullName.length > 100) {
					return res
						.status(400)
						.json({ error: 'Name must be between 2 and 100 characters' });
				}

				if (!/^[0-9+()\-\s]{7,20}$/.test(phone)) {
					return res
						.status(400)
						.json({ error: 'Please enter a valid phone number' });
				}

				if (address.length < 5 || address.length > 300) {
					return res
						.status(400)
						.json({ error: 'Address must be between 5 and 300 characters' });
				}

				if (note.length > 200) {
					return res
						.status(400)
						.json({ error: 'The reason must be 200 characters or fewer' });
				}

				const client = await pool.connect();

				try {
					await client.query('BEGIN');

					const current = await client.query(
						'SELECT full_name, phone, address, status FROM orders WHERE id = $1 FOR UPDATE',
						[id],
					);

					if (current.rows.length === 0) {
						await client.query('ROLLBACK');
						return res.status(404).json({ error: 'Order not found' });
					}

					const order = current.rows[0];

					if (!EDITABLE_STATUSES.includes(order.status)) {
						await client.query('ROLLBACK');
						return res.status(400).json({
							error: `This order can't be edited any more because it is already ${order.status.replace('_', ' ')}`,
						});
					}

					const changes = {};
					if (fullName !== order.full_name)
						changes.fullName = { from: order.full_name, to: fullName };
					if (phone !== order.phone)
						changes.phone = { from: order.phone, to: phone };
					if (address !== order.address)
						changes.address = { from: order.address, to: address };

					if (Object.keys(changes).length === 0) {
						await client.query('ROLLBACK');
						return res.status(400).json({ error: 'No changes to save' });
					}

					const updated = await client.query(
						'UPDATE orders SET full_name = $1, phone = $2, address = $3 WHERE id = $4 RETURNING full_name, phone, address',
						[fullName, phone, address, id],
					);

					await client.query(
						'INSERT INTO order_events (order_id, admin_id, admin_name, action, changes, note) VALUES ($1, $2, $3, $4, $5, $6)',
						[
							id,
							req.user.id,
							req.adminName,
							'details_edited',
							JSON.stringify(changes),
							note || null,
						],
					);

					await client.query('COMMIT');

					res.json(updated.rows[0]);
				} catch (error) {
					await client.query('ROLLBACK').catch(() => {});
					console.error(error);
					res.status(500).json({ error: 'Something went wrong' });
				} finally {
					client.release();
				}
			},
		);
		app.post('/orders/track', trackLimiter, async (req, res) => {
			try {
				const orderNumber = normalizeOrderNumber(req.body.orderNumber);

				if (!orderNumber) {
					return res.status(400).json({
						error:
							'That order number looks mistyped. Please check it and try again.',
					});
				}

				const result = await pool.query(
					'SELECT order_number, status, created_at, items, total FROM orders WHERE order_number = $1',
					[orderNumber],
				);

				if (result.rows.length === 0) {
					return res
						.status(404)
						.json({ error: "We couldn't find an order with that number." });
				}

				res.json(result.rows[0]);
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Something went wrong' });
			}
		});

		app.get('/admin/orders', requireAuth, requireAdmin, async (req, res) => {
			try {
				const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
				const pageSize = 10;
				const status = String(req.query.status || '').trim();
				const search = String(req.query.search || '').trim();

				const conditions = [];
				const values = [];

				if (status) {
					values.push(status);
					conditions.push(`status = $${values.length}`);
				}

				if (search) {
					values.push('%' + search + '%');
					conditions.push(
						`(order_number ILIKE $${values.length} OR email ILIKE $${values.length} OR phone ILIKE $${values.length} OR full_name ILIKE $${values.length})`,
					);
				}

				const where =
					conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

				const countResult = await pool.query(
					`SELECT COUNT(*) FROM orders ${where}`,
					values,
				);
				const total = Number(countResult.rows[0].count);

				const listValues = [...values, pageSize, (page - 1) * pageSize];
				const listResult = await pool.query(
					`SELECT id, order_number, full_name, email, phone, address, total, status, created_at, user_id FROM orders ${where} ORDER BY created_at DESC, id DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
					listValues,
				);

				res.json({
					orders: listResult.rows,
					page: page,
					pageSize: pageSize,
					total: total,
					totalPages: Math.max(Math.ceil(total / pageSize), 1),
				});
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Something went wrong' });
			}
		});

		app.post('/checkout', checkoutLimiter, optionalAuth, async (req, res) => {
			try {
				const { fullName, phone, address, items } = req.body;
				const email = String(req.body.email || '')
					.trim()
					.toLowerCase();

				if (
					typeof fullName !== 'string' ||
					!fullName.trim() ||
					typeof phone !== 'string' ||
					!phone.trim() ||
					typeof address !== 'string' ||
					!address.trim() ||
					!EMAIL_PATTERN.test(email)
				) {
					return res.status(400).json({
						error:
							'Please provide your name, a valid email, phone number and address',
					});
				}

				if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
					return res
						.status(400)
						.json({ error: 'Your cart is empty or invalid' });
				}

				const requested = new Map();

				for (const entry of items) {
					const productId = Number(entry && entry.productId);
					const qty = Number(entry && entry.qty);

					if (
						!Number.isInteger(productId) ||
						!Number.isInteger(qty) ||
						qty < 1
					) {
						return res.status(400).json({ error: 'Invalid item in your cart' });
					}

					requested.set(productId, (requested.get(productId) || 0) + qty);
				}

				const ids = [...requested.keys()];

				const productResult = await pool.query(
					'SELECT id, title, price, image, stock FROM products WHERE id = ANY($1::int[])',
					[ids],
				);

				if (productResult.rows.length !== ids.length) {
					return res
						.status(400)
						.json({ error: 'One or more items are no longer available' });
				}

				let total = 0;
				const orderItems = [];

				for (const product of productResult.rows) {
					const qty = requested.get(product.id);

					if (product.stock < 1) {
						return res
							.status(400)
							.json({ error: `${product.title} is out of stock` });
					}

					if (qty > product.stock) {
						return res.status(400).json({
							error: `Only ${product.stock} left of ${product.title}`,
						});
					}

					if (qty > 20) {
						return res
							.status(400)
							.json({ error: `You can order at most 20 of ${product.title}` });
					}

					total += product.price * qty;
					orderItems.push({
						id: product.id,
						title: product.title,
						price: product.price,
						image: product.image,
						qty: qty,
					});
				}

				const reference = 'ank-' + crypto.randomBytes(12).toString('hex');
				const userId = req.user ? req.user.id : null;

				let orderResult;

				for (let attempt = 0; attempt < 5; attempt++) {
					try {
						orderResult = await pool.query(
							'INSERT INTO orders (full_name, email, phone, address, items, total, payment_reference, status, user_id, order_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, payment_reference, total, order_number',
							[
								fullName.trim(),
								email,
								phone.trim(),
								address.trim(),
								JSON.stringify(orderItems),
								total,
								reference,
								'pending',
								userId,
								generateOrderNumber(),
							],
						);
						break;
					} catch (insertError) {
						if (insertError.code !== '23505') throw insertError;
					}
				}

				if (!orderResult) {
					throw new Error('Could not generate a unique order number');
				}

				res.status(201).json({
					orderId: orderResult.rows[0].id,
					reference: orderResult.rows[0].payment_reference,
					amount: orderResult.rows[0].total,
					email: email,
				});
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Something went wrong' });
			}
		});

		app.get('/verify-payment/:reference', async (req, res) => {
			try {
				const result = await confirmPayment(req.params.reference);

				if (!result.ok) {
					return res.json({ verified: false, error: result.reason });
				}

				res.json({ verified: true, order: result.order });
			} catch (error) {
				console.error(error.response ? error.response.data : error.message);
				res.status(500).json({ error: 'Verification failed' });
			}
		});
		app.post('/paystack-webhook', async (req, res) => {
			try {
				const signature = req.headers['x-paystack-signature'];

				if (!req.rawBody || !signature) {
					return res.sendStatus(400);
				}

				const expected = crypto
					.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
					.update(req.rawBody)
					.digest('hex');

				const received = Buffer.from(String(signature));
				const wanted = Buffer.from(expected);

				if (
					received.length !== wanted.length ||
					!crypto.timingSafeEqual(received, wanted)
				) {
					return res.sendStatus(401);
				}

				const event = req.body;

				if (
					event.event === 'charge.success' &&
					event.data &&
					event.data.reference
				) {
					const result = await confirmPayment(String(event.data.reference));
					console.log(
						'Webhook charge.success:',
						event.data.reference,
						result.ok ? 'confirmed' : result.reason,
					);
				}

				res.sendStatus(200);
			} catch (error) {
				console.error(
					'Webhook error:',
					error.response ? error.response.data : error.message,
				);
				res.sendStatus(500);
			}
		});
		// ===== Admin: users =====

		app.get('/admin/users', requireAuth, requireAdmin, async (req, res) => {
			try {
				const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
				const pageSize = 10;
				const role = String(req.query.role || '').trim();
				const search = String(req.query.search || '').trim();

				const conditions = [];
				const values = [];

				if (role === 'admin' || role === 'customer') {
					values.push(role);
					conditions.push(`u.role = $${values.length}`);
				}

				if (search) {
					values.push('%' + search + '%');
					conditions.push(
						`(u.full_name ILIKE $${values.length} OR u.email ILIKE $${values.length})`,
					);
				}

				const where =
					conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

				const countResult = await pool.query(
					`SELECT COUNT(*) FROM users u ${where}`,
					values,
				);
				const total = Number(countResult.rows[0].count);

				const listValues = [...values, pageSize, (page - 1) * pageSize];
				const listResult = await pool.query(
					`SELECT u.id, u.full_name, u.email, u.role, u.created_at, COUNT(o.id) AS order_count
			 FROM users u
			 LEFT JOIN orders o ON o.user_id = u.id
			 ${where}
			 GROUP BY u.id
			 ORDER BY u.created_at DESC, u.id DESC
			 LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
					listValues,
				);

				res.json({
					users: listResult.rows.map((row) => ({
						...row,
						order_count: Number(row.order_count),
					})),
					page: page,
					pageSize: pageSize,
					total: total,
					totalPages: Math.max(Math.ceil(total / pageSize), 1),
				});
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Something went wrong' });
			}
		});

		app.post(
			'/admin/admins',
			requireAuth,
			requireAdmin,
			registerLimiter,
			async (req, res) => {
				try {
					const { fullName, password } = req.body;
					const email = String(req.body.email || '')
						.trim()
						.toLowerCase();

					if (
						typeof fullName !== 'string' ||
						fullName.trim().length < 2 ||
						fullName.trim().length > 100
					) {
						return res
							.status(400)
							.json({ error: 'Name must be between 2 and 100 characters' });
					}

					if (!EMAIL_PATTERN.test(email)) {
						return res
							.status(400)
							.json({ error: 'Please enter a valid email address' });
					}

					const passwordError = validatePasswordRules(password);

					if (passwordError) {
						return res.status(400).json({ error: passwordError });
					}

					const existing = await pool.query(
						'SELECT id FROM users WHERE email = $1',
						[email],
					);

					if (existing.rows.length > 0) {
						return res
							.status(409)
							.json({ error: 'An account with this email already exists' });
					}

					const passwordHash = await bcrypt.hash(password, 10);

					const result = await pool.query(
						"INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, 'admin') RETURNING id, full_name, email, role",
						[fullName.trim(), email, passwordHash],
					);

					// A simple trace until we add a proper activity log
					console.log(`Admin created: ${email} (by ${req.adminName})`);

					res.status(201).json(result.rows[0]);
				} catch (error) {
					if (error.code === '23505') {
						return res
							.status(409)
							.json({ error: 'An account with this email already exists' });
					}
					console.error(error);
					res.status(500).json({ error: 'Something went wrong' });
				}
			},
		);
		// ===== Admin: analytics =====

		app.get('/admin/analytics', requireAuth, requireAdmin, async (req, res) => {
			try {
				const [daily, byStatus, topProducts] = await Promise.all([
					pool.query(
						`SELECT to_char(CURRENT_DATE - n, 'YYYY-MM-DD') AS day,
				        COALESCE(SUM(o.total), 0) AS revenue,
				        COUNT(o.id) AS orders
				 FROM generate_series(0, 6) AS n
				 LEFT JOIN orders o
				   ON o.created_at::date = CURRENT_DATE - n
				  AND o.status = ANY($1::text[])
				 GROUP BY n
				 ORDER BY n DESC`,
						[REVENUE_STATUSES],
					),
					pool.query(
						'SELECT status, COUNT(*) AS count FROM orders GROUP BY status ORDER BY COUNT(*) DESC',
					),
					pool.query(
						`SELECT item->>'title' AS title,
				        SUM((item->>'qty')::int) AS units,
				        SUM((item->>'qty')::int * (item->>'price')::int) AS revenue
				 FROM orders o, jsonb_array_elements(o.items) AS item
				 WHERE o.status = ANY($1::text[])
				   AND jsonb_typeof(item->'qty') = 'number'
				   AND jsonb_typeof(item->'price') = 'number'
				 GROUP BY item->>'title'
				 ORDER BY units DESC, revenue DESC
				 LIMIT 5`,
						[REVENUE_STATUSES],
					),
				]);

				res.json({
					daily: daily.rows.map((row) => ({
						day: row.day,
						revenue: Number(row.revenue),
						orders: Number(row.orders),
					})),
					byStatus: byStatus.rows.map((row) => ({
						status: row.status,
						count: Number(row.count),
					})),
					topProducts: topProducts.rows.map((row) => ({
						title: row.title,
						units: Number(row.units),
						revenue: Number(row.revenue),
					})),
				});
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Something went wrong' });
			}
		});
		// ===== Admin: notifications =====

		const ACTION_STATUSES = ['paid', 'needs_attention'];

		app.get(
			'/admin/notifications',
			requireAuth,
			requireAdmin,
			async (req, res) => {
				try {
					const countResult = await pool.query(
						'SELECT COUNT(*) FROM orders WHERE status = ANY($1::text[])',
						[ACTION_STATUSES],
					);

					const itemsResult = await pool.query(
						`SELECT id, order_number, full_name, total, status, created_at
			 FROM orders
			 WHERE status = ANY($1::text[])
			 ORDER BY (status = 'needs_attention') DESC, created_at DESC
			 LIMIT 5`,
						[ACTION_STATUSES],
					);

					res.json({
						count: Number(countResult.rows[0].count),
						items: itemsResult.rows,
					});
				} catch (error) {
					console.error(error);
					res.status(500).json({ error: 'Something went wrong' });
				}
			},
		);
		res.json(products);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Something went wrong' });
	}
});
// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
// 	console.log(`Server running on port ${PORT}`);
// });
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log('Server running on port ' + PORT);
});
