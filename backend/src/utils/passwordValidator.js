/**
 * Password Validator Utility
 * Validates password strength requirements
 */

const validatePassword = (password) => {
    const errors = [];

    // Minimum length check
    if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    // Uppercase letter check
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    // Lowercase letter check
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    // Number check
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    // Special character check
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*...)');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Check password strength level
 * Returns: weak, medium, strong
 */
const getPasswordStrength = (password) => {
    if (!password) return 'weak';

    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
};

module.exports = {
    validatePassword,
    getPasswordStrength
};
