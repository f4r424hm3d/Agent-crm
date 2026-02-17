const { FILE_SIZE_LIMITS } = require('../config/multer');
const path = require('path');

/**
 * Middleware to validate uploaded files' sizes
 * Photos should be max 2MB, documents max 5MB
 */
const validateFileSizes = (req, res, next) => {
    if (!req.files) {
        return next();
    }

    const photoFields = ['agentPhoto', 'companyPhoto'];
    const errors = [];

    // Validate each uploaded file
    Object.keys(req.files).forEach(fieldName => {
        const file = req.files[fieldName][0];
        const isPhoto = photoFields.includes(fieldName);
        const maxSize = isPhoto ? FILE_SIZE_LIMITS.photo : FILE_SIZE_LIMITS.document;
        const sizeLabel = isPhoto ? '2MB' : '5MB';

        if (file.size > maxSize) {
            errors.push(`${fieldName}: File size exceeds ${sizeLabel} limit`);
        }
    });

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'File size validation failed',
            errors: errors
        });
    }

    next();
};

/**
 * Middleware to validate required documents
 * idProof, companyLicence, agentPhoto, companyPhoto are required
 */
const validateRequiredDocuments = (req, res, next) => {
    const requiredFields = ['idProof', 'companyLicence', 'agentPhoto', 'companyPhoto'];
    const uploadedFields = req.files ? Object.keys(req.files) : [];
    const missingFields = requiredFields.filter(field => !uploadedFields.includes(field));

    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Required documents missing',
            missingDocuments: missingFields
        });
    }

    next();
};

/**
 * Middleware to strictly validate ALL required documents for public registration
 */
const validateRegistrationDocuments = (req, res, next) => {
    const requiredFields = [
        'idProof',
        'companyLicence',
        'agentPhoto',
        'companyPhoto',
        'identityDocument',
        'companyRegistration',
        'resume'
    ];

    // Check if files exist at all
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'All documents are required for registration.',
            missingDocuments: requiredFields
        });
    }

    const uploadedFields = Object.keys(req.files);
    const missingFields = requiredFields.filter(field => !uploadedFields.includes(field));

    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'All documents are strictly required for public registration',
            missingDocuments: missingFields
        });
    }

    next();
};

module.exports = {
    validateFileSizes,
    validateRequiredDocuments,
    validateRegistrationDocuments
};
