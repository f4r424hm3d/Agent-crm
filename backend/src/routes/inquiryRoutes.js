const express = require('express');
const router = express.Router();
const InquiryController = require('../controllers/inquiryController');
const { upload } = require('../config/multer');
const { validateFileSizes, validateRequiredDocuments } = require('../middleware/uploadMiddleware');

// Public routes for partner application
router.post('/partner-application', InquiryController.submitPartnerApplication);
router.post('/send-otp', InquiryController.sendVerificationOTP);
router.post('/verify-otp', InquiryController.verifyOTP);

// Document upload route with multer middleware
router.post('/upload-agent-documents',
    upload.fields([
        { name: 'idProof', maxCount: 1 },
        { name: 'companyLicence', maxCount: 1 },
        { name: 'agentPhoto', maxCount: 1 },
        { name: 'identityDocument', maxCount: 1 },
        { name: 'companyRegistration', maxCount: 1 },
        { name: 'resume', maxCount: 1 },
        { name: 'companyPhoto', maxCount: 1 }
    ]),
    validateFileSizes,
    validateRequiredDocuments,
    InquiryController.uploadAgentDocuments
);

router.get('/application-status/:token', InquiryController.getApplicationStatus);

module.exports = router;
