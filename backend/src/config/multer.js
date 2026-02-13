const multer = require('multer');
const path = require('path');
const fs = require('fs');

// File type validation
const FILE_TYPES = {
    documents: ['application/pdf'],
    photos: ['image/jpeg', 'image/jpg', 'image/png']
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
    photo: 2 * 1024 * 1024, // 2MB
    document: 5 * 1024 * 1024 // 5MB
};

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Folder will be created in middleware after we have agent details
        const baseDir = path.join(__dirname, '../../documents/agents');

        // Ensure base directory exists
        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir, { recursive: true });
        }

        cb(null, baseDir);
    },
    filename: function (req, file, cb) {
        // Temporary filename, will be moved to proper location in controller
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
    const isPhoto = ['agentPhoto', 'companyPhoto'].includes(file.fieldname);
    const allowedTypes = isPhoto ? FILE_TYPES.photos : FILE_TYPES.documents;

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const allowedExtensions = isPhoto ? 'JPG, JPEG, PNG' : 'PDF';
        cb(new Error(`Invalid file type for ${file.fieldname}. Only ${allowedExtensions} files are allowed.`), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: FILE_SIZE_LIMITS.document // Max limit, will validate individually in middleware
    }
});

module.exports = { upload, FILE_SIZE_LIMITS };
