const express = require('express');
const router = express.Router();
const ExternalApiController = require('../controllers/externalApiController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * All routes here require authentication to enforce agent-based restrictions
 */
router.use(authMiddleware);

// Proxy Routes
router.get('/countries', ExternalApiController.getCountries);
router.get('/universities', ExternalApiController.getUniversities);
router.get('/levels', ExternalApiController.getLevels);
router.get('/categories', ExternalApiController.getCategories);
router.get('/specializations', ExternalApiController.getSpecializations);
router.get('/programs', ExternalApiController.getPrograms);

module.exports = router;
