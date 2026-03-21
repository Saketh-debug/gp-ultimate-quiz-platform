const jwt = require('jsonwebtoken');
const pool = require('../db');

/**
 * Verifies the JWT from the Authorization header.
 * Also checks session_version in the DB — if the user re-joined (new JWT),
 * all older JWTs for that user are automatically rejected (401).
 */
async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
        return res.status(401).json({ error: msg });
    }

    // Session version check — only applies to user tokens (not admin tokens)
    // Admin JWTs have adminId/role='admin' but no userId or sessionVersion
    if (decoded.role !== 'admin') {
        try {
            const result = await pool.query(
                'SELECT session_version FROM users WHERE id = $1',
                [decoded.userId]
            );
            if (!result.rows[0] || result.rows[0].session_version !== decoded.sessionVersion) {
                return res.status(401).json({ error: 'Logged in elsewhere. Please rejoin.' });
            }
        } catch (err) {
            console.error('Auth DB check failed:', err.message);
            return res.status(500).json({ error: 'Authentication failed' });
        }
    }

    req.user = decoded; // { userId, username, role, sessionVersion, iat, exp }
    next();
}

/**
 * Checks that the authenticated user has the 'admin' role.
 * Must be used AFTER authenticateToken.
 */
function authorizeAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

/**
 * Authenticates internal server-to-server calls from the dispatcher.
 * Rejects any request that doesn't carry the shared INTERNAL_SECRET header.
 * This prevents users from calling submit-result directly via Postman or curl.
 *
 * The dispatcher injects x-user-id as a header, so req.user.userId is available
 * to the route handler just like with authenticateToken.
 */
function authenticateInternal(req, res, next) {
    if (req.headers['x-internal-secret'] !== process.env.INTERNAL_SECRET) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    req.user = { userId: parseInt(req.headers['x-user-id'], 10) };
    next();
}

module.exports = { authenticateToken, authorizeAdmin, authenticateInternal };

