const express = require('express');
const router = express.Router();
const mailSignatureController = require('../controllers/mailSignatureController');
const authMiddleware = require('../middlewares/authMiddleware');
const { roleMiddleware, roles } = require('../middlewares/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(roles.ALL_ADMINS));

router.get('/', mailSignatureController.getSignatures);
router.post('/', mailSignatureController.createSignature);
router.put('/:id', mailSignatureController.updateSignature);
router.delete('/:id', mailSignatureController.deleteSignature);
router.patch('/:id/active', mailSignatureController.toggleActive);

module.exports = router;
