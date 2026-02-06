const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const { roleMiddleware, roles } = require('../middlewares/roleMiddleware');

/**
 * @route   POST /api/upload
 * @desc    Upload a file (image)
 * @access  Private (Admin, Super Admin)
 */
router.post(
    '/',
    authMiddleware,
    // roleMiddleware(roles.ALL_ADMINS), // Allow all admins or just super admin? Let's allow all admins for now or strictly super admin as per settings requirement.
    // Since settings are usually super admin, let's keep it restricted if this is ONLY for settings. 
    // But generic upload might be used elsewhere. Let's use authMiddleware only for now, or match settings role.
    roleMiddleware(roles.SUPER_ADMIN_ONLY),
    upload.single('file'),
    (req, res) => {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Return the URL path to the file
        // NOTE: In production, this should include domain or be relative to base URL.
        // Here we return relative path from server root (served via static)
        const fileUrl = `/uploads/settings/${req.file.filename}`;

        res.json({
            success: true,
            message: 'File uploaded successfully',
            url: fileUrl,
            filename: req.file.filename
        });
    }
);

module.exports = router;
