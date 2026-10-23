const { rateLimit } = require('express-rate-limit');

function makeLimiter(options) {
	return rateLimit({
		windowMs: options.windowMs,
		limit: options.limit,
		skipSuccessfulRequests: options.skipSuccessfulRequests || false,
		standardHeaders: 'draft-7',
		legacyHeaders: false,
		message: { error: options.message },
	});
}

const trackLimiter = makeLimiter({
	windowMs: 15 * 60 * 1000,
	limit: 20,
	message:
		'Too many tracking attempts. Please wait a few minutes and try again, thank you.',
});

const loginLimiter = makeLimiter({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	skipSuccessfulRequests: true,
	message:
		'Too many failed login attempts. Please wait 15 minutes and try again, thank you',
});

const registerLimiter = makeLimiter({
	windowMs: 60 * 60 * 1000,
	limit: 10,
	message: 'Too many sign-up attempts. Please try again later, thank you.',
});

const checkoutLimiter = makeLimiter({
	windowMs: 15 * 60 * 1000,
	limit: 20,
	message:
		'Too many checkout attempts. Please wait a few minutes and try again',
});

const passwordLimiter = makeLimiter({
	windowsMs: 15 * 60 * 1000,
	limit: 10,
	skipSuccessfulRequests: true,
	message: 'Too many failed attempts. Please wait 15 minutes and try again',
});
module.exports = {
	trackLimiter,
	loginLimiter,
	registerLimiter,
	checkoutLimiter,
	passwordLimiter,
};
