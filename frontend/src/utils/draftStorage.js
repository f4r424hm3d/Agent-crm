/**
 * LocalStorage utility for managing temporary student ID and draft persistence
 */

const TEMP_STUDENT_ID_KEY = 'tempStudentId';
const DRAFT_EXPIRY_KEY = 'studentDraftExpiry';
const DRAFT_EXPIRY_DAYS = 30;

/**
 * Save temporary student ID to localStorage with expiry
 * @param {string} tempId - Temporary student ID
 */
export const saveTempStudentId = (tempId) => {
    try {
        const expiryDate = Date.now() + (DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
        localStorage.setItem(TEMP_STUDENT_ID_KEY, tempId);
        localStorage.setItem(DRAFT_EXPIRY_KEY, expiryDate.toString());
        console.log('Temp student ID saved:', tempId);
    } catch (error) {
        console.error('Failed to save temp student ID:', error);
    }
};

/**
 * Get temporary student ID from localStorage
 * Returns null if expired or not found
 * @returns {string|null}
 */
export const getTempStudentId = () => {
    try {
        const tempId = localStorage.getItem(TEMP_STUDENT_ID_KEY);
        const expiry = localStorage.getItem(DRAFT_EXPIRY_KEY);

        if (!tempId || !expiry) {
            return null;
        }

        // Check if expired
        if (Date.now() > parseInt(expiry)) {
            console.log('Draft expired, clearing localStorage');
            clearTempStudentId();
            return null;
        }

        return tempId;
    } catch (error) {
        console.error('Failed to get temp student ID:', error);
        return null;
    }
};

/**
 * Clear temporary student ID from localStorage
 */
export const clearTempStudentId = () => {
    try {
        localStorage.removeItem(TEMP_STUDENT_ID_KEY);
        localStorage.removeItem(DRAFT_EXPIRY_KEY);
        console.log('Temp student ID cleared');
    } catch (error) {
        console.error('Failed to clear temp student ID:', error);
    }
};

/**
 * Check if a draft exists and is valid
 * @returns {boolean}
 */
export const hasDraft = () => {
    return getTempStudentId() !== null;
};

/**
 * Get days remaining until draft expires
 * @returns {number|null}
 */
export const getDaysUntilExpiry = () => {
    try {
        const expiry = localStorage.getItem(DRAFT_EXPIRY_KEY);
        if (!expiry) return null;

        const daysRemaining = Math.ceil((parseInt(expiry) - Date.now()) / (24 * 60 * 60 * 1000));
        return Math.max(0, daysRemaining);
    } catch (error) {
        return null;
    }
};
