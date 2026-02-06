const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settingsController');
const authMiddleware = require('../middlewares/authMiddleware');
const { roleMiddleware, roles } = require('../middlewares/roleMiddleware');

// Public route for fetching settings (Branding/Contact info needed for Login page)
router.get('/', SettingsController.getSettings);

// Protected routes for updating settings
router.use(authMiddleware);
router.use(roleMiddleware(roles.ALL_ADMINS));

router.put('/', SettingsController.updateSettings);

module.exports = router;
