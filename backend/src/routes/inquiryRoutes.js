const express = require('express');
const router = express.Router();
const InquiryController = require('../controllers/inquiryController');

// Public route for partner application
router.post('/partner-application', InquiryController.submitPartnerApplication);

module.exports = router;
