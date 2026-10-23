import fs from 'fs';
// Import your products. Node v24 requires the full file extension (.js or .mjs)
import rawProducts from './rawProducts.js';

// Safely extract the array from default or named exports
const products = Array.isArray(rawProducts)
	? rawProducts
	: rawProducts.default ||
		rawProducts.products ||
		Object.values(rawProducts).find(Array.isArray);

if (!products || !Array.isArray(products)) {
	console.error(
		'❌ Could not find an array. Current structure of imported data:',
		rawProducts,
	);
	process.exit(1);
}

function escapeText(value) {
	if (value === null || value === undefined) return 'NULL';
	return `'${String(value).replace(/'/g, "''")}'`;
}

function parsePrice(priceText) {
	return Number.parseInt(String(priceText).replace(/[^\d]/g, ''), 10) || 0;
}

const lines = products.map((p) => {
	const values = [
		escapeText(p.title),
		parsePrice(p.price),
		escapeText(p.image),
		escapeText(p.statusText),
		escapeText(p.statusClass),
		escapeText(p.section),
		escapeText(p.category),
	];
	return `(${values.join(', ')})`;
});

const sql =
	'TRUNCATE TABLE products RESTART IDENTITY;\n\n' +
	'INSERT INTO products (title, price, image, status_text, status_class, section, category) VALUES\n' +
	lines.join(',\n') +
	';\n';

fs.writeFileSync('seed.sql', sql, 'utf8');
console.log(`✅ Generated seed.sql with ${products.length} products.`);
