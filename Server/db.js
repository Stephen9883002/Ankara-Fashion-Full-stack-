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

// Automatically create the products table if it doesn't exist
const initializeDatabase = async () => {
	try {
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
		console.log('✅ Products table checked/created successfully!');
	} catch (err) {
		console.error('❌ Error automatically initializing database table:', err);
	}
};

initializeDatabase();
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

// Automatically create the products table if it doesn't exist
const initializeDatabase = async () => {
	try {
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
		console.log('✅ Products table checked/created successfully!');
	} catch (err) {
		console.error('❌ Error automatically initializing database table:', err);
	}
};

initializeDatabase();
