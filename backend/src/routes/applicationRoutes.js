const express = require('express');
const router = express.Router();
const ApplicationController = require('../controllers/applicationController');
const authMiddleware = require('../middlewares/authMiddleware');
const { roleMiddleware, roles } = require('../middlewares/roleMiddleware');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer for payment proof uploads
const paymentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = path.join(__dirname, '../../uploads/temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `pay-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const paymentUpload = multer({
  storage: paymentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, PDF files are allowed'), false);
  }
});

const validateRequest = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

// ── Static routes first (before :id param routes) ──

/**
 * @route   GET /api/applications/pending-students
 * @desc    Get students without any applications
 * @access  Private (Agent, Admin)
 */
router.get('/pending-students', authMiddleware, ApplicationController.getPendingStudents);

/**
 * @route   GET /api/applications/applied-students
 * @desc    Get students with existing applications
 * @access  Private (Agent, Admin)
 */
router.get('/applied-students', authMiddleware, ApplicationController.getAppliedStudents);

/**
 * @route   GET /api/applications/student/:studentId
 * @desc    Get all applications for a specific student
 * @access  Private
 */
router.get('/student/:studentId', authMiddleware, ApplicationController.getStudentApplications);

/**
 * @route   GET /api/applications
 * @desc    Get all applications (filtered by role)
 * @access  Private
 */
router.get('/', authMiddleware, ApplicationController.getApplications);

/**
 * @route   POST /api/applications
 * @desc    Create new application
 * @access  Private (Agent, Admin)
 */
router.post(
  '/',
  authMiddleware,
  [
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('programId').notEmpty().withMessage('Program ID is required'),
    body('programSnapshot').isObject().withMessage('Program details snapshot is required'),
  ],
  validateRequest,
  ApplicationController.createApplication
);

// ── Param routes ──

/**
 * @route   GET /api/applications/:id
 * @desc    Get single application by ID
 * @access  Private
 */
router.get('/:id', authMiddleware, ApplicationController.getApplicationById);

/**
 * @route   DELETE /api/applications/:id
 * @desc    Delete application (only if not paid)
 * @access  Private
 */
router.delete('/:id', authMiddleware, ApplicationController.deleteApplication);

/**
 * @route   PUT /api/applications/:id/status
 * @desc    Update application payment status
 * @access  Private (Admin, SuperAdmin)
 */
router.put(
  '/:id/status',
  authMiddleware,
  [
    body('status').notEmpty().isIn(['paid', 'unpaid', 'cancelled']).withMessage('Status must be paid, unpaid, or cancelled'),
  ],
  validateRequest,
  ApplicationController.updateApplicationStatus
);

/**
 * @route   PUT /api/applications/:id/stage
 * @desc    Update application stage
 * @access  Private (Admin, SuperAdmin)
 */
router.put(
  '/:id/stage',
  authMiddleware,
  [
    body('stage').notEmpty().withMessage('Stage is required'),
  ],
  validateRequest,
  ApplicationController.updateApplicationStage
);

/**
 * @route   POST /api/applications/:id/send-mail
 * @desc    Send email for an application
 * @access  Private
 */
router.post(
  '/:id/send-mail',
  authMiddleware,
  [
    body('sentTo').notEmpty().isEmail().withMessage('Valid recipient email is required'),
    body('messageBody').notEmpty().withMessage('Message body is required'),
  ],
  validateRequest,
  ApplicationController.sendApplicationMail
);
/**
 * @route   PUT /api/applications/:id/pay
 * @desc    Update payment with proof files
 * @access  Private
 */
router.put(
  '/:id/pay',
  authMiddleware,
  paymentUpload.array('paymentProof', 5),
  ApplicationController.updatePayment
);

module.exports = router;
