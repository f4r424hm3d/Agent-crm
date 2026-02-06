const crypto = require('crypto');

/**
 * Generate a unique temporary student ID
 * Format: TEMP_STU_{timestamp}_{randomHex}
 * Example: TEMP_STU_1738754321_A3F2B1C4
 */
const generateTempStudentId = () => {
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `TEMP_STU_${timestamp}_${randomStr}`;
};

module.exports = { generateTempStudentId };
