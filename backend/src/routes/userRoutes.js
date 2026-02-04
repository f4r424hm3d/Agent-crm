const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const { USER_ROLES } = require('../utils/constants');

// Protect all routes
router.use(authMiddleware);

/**
 * @route   GET /api/users
 * @desc    Get all users (with filtering)
 * @access  Private (Admin/Super Admin)
 */
router.get(
    '/',
    roleMiddleware([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]),
    UserController.getUsers
);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Private (Super Admin)
 */
router.post(
    '/',
    roleMiddleware([USER_ROLES.SUPER_ADMIN]),
    UserController.createUser
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Super Admin)
 */
router.put(
    '/:id',
    roleMiddleware([USER_ROLES.SUPER_ADMIN]),
    UserController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Super Admin)
 */
router.delete(
    '/:id',
    roleMiddleware([USER_ROLES.SUPER_ADMIN]),
    UserController.deleteUser
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', UserController.getUserById);

module.exports = router;
