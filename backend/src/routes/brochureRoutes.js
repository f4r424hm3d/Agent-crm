const express = require('express');
const router = express.Router();
const BrochureController = require('../controllers/brochureController');
const authMiddleware = require('../middlewares/authMiddleware');
const { roleMiddleware, roles } = require('../middlewares/roleMiddleware');
const documentUpload = require('../middlewares/documentUploadMiddleware');

// Brochure Types
router.get('/types', authMiddleware, BrochureController.getAllBrochureTypes);
router.post('/types', authMiddleware, roleMiddleware(roles.ALL_ADMINS), BrochureController.createBrochureType);
router.put('/types/:id', authMiddleware, roleMiddleware(roles.ALL_ADMINS), BrochureController.updateBrochureType);
router.delete('/types/:id', authMiddleware, roleMiddleware(roles.ALL_ADMINS), BrochureController.deleteBrochureType);

// Brochure Categories
router.get('/categories', authMiddleware, BrochureController.getAllCategories);
router.post('/categories', authMiddleware, roleMiddleware(roles.ALL_ADMINS), BrochureController.createCategory);
router.put('/categories/:id', authMiddleware, roleMiddleware(roles.ALL_ADMINS), BrochureController.updateCategory);
router.delete('/categories/:id', authMiddleware, roleMiddleware(roles.ALL_ADMINS), BrochureController.deleteCategory);

// University Programs (ups)
router.get('/ups', authMiddleware, BrochureController.getAllUniversityPrograms);
router.get('/ups/:id', authMiddleware, BrochureController.getUPById);
router.get('/types/:typeId/ups', authMiddleware, BrochureController.getUniversityProgramsByType);
router.post('/ups', authMiddleware, roleMiddleware(roles.ALL_ADMINS), BrochureController.createUniversityProgram);
router.put('/ups/:id', authMiddleware, roleMiddleware(roles.ALL_ADMINS), BrochureController.updateUniversityProgram);
router.delete('/ups/:id', authMiddleware, roleMiddleware(roles.ALL_ADMINS), BrochureController.deleteUniversityProgram);

// Brochures
router.get('/ups/:upId/brochures', authMiddleware, BrochureController.getBrochuresByUP);
router.post('/ups/:upId/brochures', authMiddleware, roleMiddleware(roles.ALL_ADMINS), documentUpload.single('file'), BrochureController.createBrochure);
router.put('/brochures/:id', authMiddleware, roleMiddleware(roles.ALL_ADMINS), documentUpload.single('file'), BrochureController.updateBrochure);
router.delete('/brochures/:id', authMiddleware, roleMiddleware(roles.ALL_ADMINS), BrochureController.deleteBrochure);

module.exports = router;
