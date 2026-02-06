const crypto = require('crypto');

/**
 * Generate secure signed token for referral data
 * @param {Object} payload - Data to sign (referralId, userRole, etc.)
 * @param {string} secret - Secret key for signing
 * @returns {string} - Signed token
 */
const generateSignedToken = (payload, secret) => {
    const timestamp = Date.now();
    const data = {
        ...payload,
        timestamp,
        exp: timestamp + (30 * 24 * 60 * 60 * 1000) // 30 days expiry
    };

    const dataString = JSON.stringify(data);
    const signature = crypto
        .createHmac('sha256', secret)
        .update(dataString)
        .digest('hex');

    return `${Buffer.from(dataString).toString('base64')}.${signature}`;
};

/**
 * Verify signed token
 * @param {string} token - Signed token to verify
 * @param {string} secret - Secret key for verification
 * @returns {Object|null} - Decoded payload or null if invalid
 */
const verifySignedToken = (token, secret) => {
    try {
        const [dataBase64, signature] = token.split('.');

        if (!dataBase64 || !signature) {
            return null;
        }

        const dataString = Buffer.from(dataBase64, 'base64').toString('utf-8');
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(dataString)
            .digest('hex');

        // Verify signature
        if (signature !== expectedSignature) {
            return null;
        }

        const data = JSON.parse(dataString);

        // Check expiry
        if (data.exp && Date.now() > data.exp) {
            return null;
        }

        return data;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
};

module.exports = {
    generateSignedToken,
    verifySignedToken
};
