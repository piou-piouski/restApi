const { rateLimit } = require('express-rate-limit');

const createLimiter = ({ windowMs = 15 * 60 * 1000, limit = 100 } = {}) => rateLimit({
	windowMs,
	limit,
	standardHeaders: 'draft-8', // en-tête combiné `RateLimit` (draft-6 : en-têtes `RateLimit-*`)
	legacyHeaders: false, // désactive les en-têtes `X-RateLimit-*`
	ipv6Subnet: 56, // 60 ou 64 = moins agressif, 52 ou 48 = plus agressif
	// store: ... , // Redis, Memcached, etc. si plusieurs instances de l'API
});

module.exports = createLimiter;
