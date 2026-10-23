require('dotenv').config();
const { Pool } = require('pg');

// Setup connection based on environment (Render vs Local Laptop)
const pool = process.env.DATABASE_URL
	? new Pool({
			connectionString: process.env.DATABASE_URL,
			ssl: {
				rejectUnauthorized: false,
			},
		})
	: new Pool({
			user: process.env.DB_USER,
			host: process.env.DB_HOST,
			database: process.env.DB_NAME,
			password: process.env.DB_PASSWORD,
			port: process.env.DB_PORT,
		});

module.exports = pool;

// Automatically create all required tables if they don't exist
const initializeDatabase = async () => {
	try {
		// 1. Create Products Table
		await pool.query(`
			CREATE TABLE IF NOT EXISTS products (
				id SERIAL PRIMARY KEY,
				title VARCHAR(255) NOT NULL,
				price INT NOT NULL,
				image TEXT,
				status_text VARCHAR(100),
				status_class VARCHAR(100),
				section VARCHAR(100),
				category VARCHAR(100)
			);
		`);

		// FORCE ADD STOCK COLUMN IF IT DOES NOT EXIST
		await pool.query(`
			ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INT DEFAULT 10;
		`);

		// 2. Create Users Table
		await pool.query(`
			CREATE TABLE IF NOT EXISTS users (
				id SERIAL PRIMARY KEY,
				full_name VARCHAR(255) NOT NULL,
				email VARCHAR(255) UNIQUE NOT NULL,
				password_hash VARCHAR(255) NOT NULL,
				role VARCHAR(50) DEFAULT 'user'
			);
		`);

		// 3. Create Orders Table
		await pool.query(`
			CREATE TABLE IF NOT EXISTS orders (
				id SERIAL PRIMARY KEY,
				full_name VARCHAR(255) NOT NULL,
				email VARCHAR(255) NOT NULL,
				phone VARCHAR(50) NOT NULL,
				address TEXT NOT NULL,
				items JSONB NOT NULL,
				total INT NOT NULL,
				payment_reference VARCHAR(255),
				status VARCHAR(50) DEFAULT 'pending',
				user_id INT REFERENCES users(id) ON DELETE SET NULL,
				order_number VARCHAR(100) UNIQUE NOT NULL
			);
		`);

		console.log(
			'✅ All database tables verified, altered, and created successfully!',
		);
	} catch (err) {
		console.error('❌ Error automatically initializing database tables:', err);
	}
};

// Automatically seed products if the table is completely empty
const seedProductsIfEmpty = async () => {
	try {
		const res = await pool.query('SELECT COUNT(*) FROM products');
		if (parseInt(res.rows[0].count, 10) === 0) {
			console.log('🚚 Products table is empty. Starting automatic seeding...');

			const rawProducts = require('./rawProducts.js');
			const products = Array.isArray(rawProducts)
				? rawProducts
				: rawProducts.default || rawProducts.products || [];

			for (const p of products) {
				await pool.query(
					`INSERT INTO products (title, price, image, status_text, status_class, section, category, stock) 
					 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
					[
						p.title,
						parseInt(String(p.price).replace(/[^\d]/g, ''), 10) || 0,
						p.image,
						p.statusText,
						p.statusClass,
						p.section,
						p.category,
						10, // Sets default stock inventory to 10 items
					],
				);
			}
			console.log(
				`✨ Successfully seeded ${products.length} products into the live database!`,
			);
		}
	} catch (err) {
		console.error('❌ Seeding failed:', err);
	}
};

// Run setup steps in order
const startSetup = async () => {
	await initializeDatabase();
	await seedProductsIfEmpty();
};

startSetup();
